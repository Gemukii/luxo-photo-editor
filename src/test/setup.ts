// Node has no ImageData, so tests use this minimal stand-in.
class TestImageData {
  data: Uint8ClampedArray
  width: number
  height: number

  constructor(dataOrWidth: Uint8ClampedArray | number, width: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth
      this.height = width
      this.data = new Uint8ClampedArray(dataOrWidth * width * 4)
    } else {
      this.data = dataOrWidth
      this.width = width
      this.height = height ?? dataOrWidth.length / 4 / width
    }
  }
}

globalThis.ImageData = TestImageData as unknown as typeof ImageData
