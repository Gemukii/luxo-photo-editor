import { croppedSize } from '@/lib/crop'
import { Lut } from '@/lib/looks/cube'
import { ADJUSTMENT_UNIFORMS, FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'
import { RenderEdit, Renderer, RenderParams } from './types'

const FULL_FRAME = { x: 0, y: 0, width: 1, height: 1 }

const compileShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create a shader')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Failed to compile a shader: ${gl.getShaderInfoLog(shader)}`)
  }

  return shader
}

const createProgram = (gl: WebGL2RenderingContext) => {
  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create a program')

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Failed to link a program: ${gl.getProgramInfoLog(program)}`)
  }

  return program
}

export class GlRenderer implements Renderer {
  readonly kind = 'webgl2'
  readonly maxSourceSize: number

  private program!: WebGLProgram
  private uniforms = new Map<string, WebGLUniformLocation | null>()
  private sourceTexture!: WebGLTexture
  private emptyLut!: WebGLTexture
  private lutTextures = new Map<string, WebGLTexture>()
  private readTexture!: WebGLTexture
  private readBuffer!: WebGLFramebuffer
  private source: HTMLCanvasElement | null = null

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
    private readonly useMipmaps: boolean,
    private readonly onRestored?: () => void
  ) {
    this.maxSourceSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    this.initialize()
    canvas.addEventListener('webglcontextlost', this.handleContextLost)
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored)
  }

  static create(
    canvas: HTMLCanvasElement,
    options: { useMipmaps?: boolean; onRestored?: () => void } = {}
  ): GlRenderer | null {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    })

    return gl ? new GlRenderer(canvas, gl, options.useMipmaps ?? true, options.onRestored) : null
  }

  private initialize() {
    const { gl } = this

    this.program = createProgram(gl)
    gl.useProgram(this.program)

    const names = ['uFlipY', 'uCrop', 'uLutSize', 'uLutMix', 'uCompareSplit', ...ADJUSTMENT_UNIFORMS]
    this.uniforms = new Map(names.map((name) => [name, gl.getUniformLocation(this.program, name)]))

    gl.uniform1i(gl.getUniformLocation(this.program, 'uSource'), 0)
    gl.uniform1i(gl.getUniformLocation(this.program, 'uLut'), 1)

    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.disable(gl.BLEND)

    this.sourceTexture = this.createTexture2D()
    this.readTexture = this.createTexture2D()
    this.readBuffer = gl.createFramebuffer()!
    this.emptyLut = this.createLutTexture(new Float32Array(8 * 4), 2)
    this.lutTextures.clear()
  }

  private createTexture2D() {
    const { gl } = this
    const texture = gl.createTexture()!

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    return texture
  }

  private createLutTexture(rgba: Float32Array, size: number) {
    const { gl } = this
    const texture = gl.createTexture()!

    gl.bindTexture(gl.TEXTURE_3D, texture)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA16F, size, size, size, 0, gl.RGBA, gl.FLOAT, rgba)

    return texture
  }

  private getLutTexture(lut: Lut) {
    const existing = this.lutTextures.get(lut.id)
    if (existing) return existing

    const count = lut.size ** 3
    const rgba = new Float32Array(count * 4)

    for (let i = 0; i < count; i++) {
      rgba[i * 4] = lut.data[i * 3]
      rgba[i * 4 + 1] = lut.data[i * 3 + 1]
      rgba[i * 4 + 2] = lut.data[i * 3 + 2]
      rgba[i * 4 + 3] = 1
    }

    const texture = this.createLutTexture(rgba, lut.size)
    this.lutTextures.set(lut.id, texture)

    return texture
  }

  setSource(source: HTMLCanvasElement) {
    const { gl } = this

    this.source = source

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source)

    if (this.useMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    }
  }

  private draw(edit: RenderEdit, compareSplit: number | null, flipY: boolean) {
    const { gl, uniforms } = this
    const crop = edit.crop ?? FULL_FRAME
    const useLut = edit.lut !== null && edit.lutMix > 0

    gl.useProgram(this.program)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_3D, useLut ? this.getLutTexture(edit.lut!) : this.emptyLut)

    gl.uniform1i(uniforms.get('uFlipY')!, flipY ? 1 : 0)
    gl.uniform4f(uniforms.get('uCrop')!, crop.x, crop.y, crop.width, crop.height)
    gl.uniform1f(uniforms.get('uLutSize')!, useLut ? edit.lut!.size : 2)
    gl.uniform1f(uniforms.get('uLutMix')!, useLut ? edit.lutMix : 0)
    gl.uniform1f(uniforms.get('uCompareSplit')!, compareSplit ?? -1)

    for (const key of ADJUSTMENT_UNIFORMS) {
      gl.uniform1f(uniforms.get(key)!, edit.adjustments[key])
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  render(params: RenderParams) {
    if (!this.source) return

    const { gl, canvas } = this
    const { width, height } = croppedSize(this.source, params.crop)

    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
    this.draw(params, params.compareSplit, true)
  }

  readPreview(edit: RenderEdit, maxWidth: number) {
    const { gl } = this
    const source = this.source ?? { width: 1, height: 1 }
    const size = croppedSize(source, edit.crop)
    const width = Math.min(maxWidth, size.width)
    const height = Math.max(1, Math.round(size.height * (width / size.width)))

    gl.bindTexture(gl.TEXTURE_2D, this.readTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.readBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.readTexture, 0)
    gl.viewport(0, 0, width, height)

    this.draw(edit, null, false)

    const pixels = new Uint8ClampedArray(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return new ImageData(pixels, width, height)
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault()
  }

  private handleContextRestored = () => {
    this.initialize()
    if (this.source) this.setSource(this.source)
    this.onRestored?.()
  }

  dispose({ releaseContext = false } = {}) {
    const { gl, canvas } = this

    canvas.removeEventListener('webglcontextlost', this.handleContextLost)
    canvas.removeEventListener('webglcontextrestored', this.handleContextRestored)

    gl.deleteTexture(this.sourceTexture)
    gl.deleteTexture(this.readTexture)
    gl.deleteTexture(this.emptyLut)
    gl.deleteFramebuffer(this.readBuffer)
    gl.deleteProgram(this.program)
    this.lutTextures.forEach((texture) => gl.deleteTexture(texture))
    this.lutTextures.clear()

    if (releaseContext) gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
