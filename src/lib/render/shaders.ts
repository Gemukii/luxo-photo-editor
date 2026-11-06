import { Adjustments } from '@/types/editor.types'

export const ADJUSTMENT_UNIFORMS: (keyof Adjustments)[] = [
  'exposure',
  'contrast',
  'highlights',
  'shadows',
  'whites',
  'blacks',
  'saturation',
  'vibrance',
  'temperature',
  'tint',
]

export const VERTEX_SHADER = `#version 300 es
uniform bool uFlipY;
out vec2 vUv;

// One oversized triangle covers the viewport, with no vertex buffer
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = vec2(position.x, uFlipY ? 1.0 - position.y : position.y);
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`

// adjust() mirrors applyAdjustments in src/lib/imageProcessor.ts, step for step.
// Check any change with the parity report at /dev/parity.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
precision highp sampler3D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uSource;
uniform sampler3D uLut;
uniform vec4 uCrop;
uniform float uLutSize;
uniform float uLutMix;
uniform float uCompareSplit;

uniform float exposure;
uniform float contrast;
uniform float highlights;
uniform float shadows;
uniform float whites;
uniform float blacks;
uniform float saturation;
uniform float vibrance;
uniform float temperature;
uniform float tint;

float brightnessOf(vec3 c) {
  return (c.r + c.g + c.b) / 3.0;
}

float grayOf(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 adjust(vec3 c) {
  c *= exp2(exposure);

  c = ((c / 255.0 - 0.5) * ((contrast + 100.0) / 100.0) + 0.5) * 255.0;

  float brightness = brightnessOf(c);
  if (brightness > 128.0) {
    c += ((brightness - 128.0) / 127.0) * (highlights / 100.0) * 50.0;
  }

  brightness = brightnessOf(c);
  if (brightness < 128.0) {
    c += ((128.0 - brightness) / 128.0) * (shadows / 100.0) * 50.0;
  }

  brightness = brightnessOf(c);
  if (brightness > 180.0) {
    c += ((brightness - 180.0) / 75.0) * (whites / 100.0) * 50.0;
  }

  brightness = brightnessOf(c);
  if (brightness < 75.0) {
    c -= ((75.0 - brightness) / 75.0) * (blacks / 100.0) * 30.0;
  }

  c.r += temperature / 100.0 * 40.0;
  c.b -= temperature / 100.0 * 40.0;

  c.r += tint / 100.0 * 20.0;
  c.g -= tint / 100.0 * 20.0;

  float gray = grayOf(c);
  c = gray + (c - gray) * ((saturation + 100.0) / 100.0);

  float currentSaturation = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  if (currentSaturation < 128.0) {
    gray = grayOf(c);
    c = gray + (c - gray) * (1.0 + (vibrance / 100.0) * ((128.0 - currentSaturation) / 128.0));
  }

  return c;
}

void main() {
  vec4 source = texture(uSource, uCrop.xy + vUv * uCrop.zw);

  if (vUv.x < uCompareSplit) {
    outColor = source;
    return;
  }

  vec3 color = clamp(adjust(source.rgb * 255.0) / 255.0, 0.0, 1.0);

  if (uLutMix > 0.0) {
    vec3 coordinates = (color * (uLutSize - 1.0) + 0.5) / uLutSize;
    color = mix(color, texture(uLut, coordinates).rgb, uLutMix);
  }

  outColor = vec4(color, source.a);
}
`
