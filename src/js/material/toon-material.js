import * as THREE from "three";

/**
 * Custom Toon Material
 */
export class CustomToonMaterial extends THREE.ShaderMaterial {
  static VERT_SHADER = `
varying vec2 vUv;
varying vec3 vWorldNormal;

void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

  static FRAG_SHADER = `
uniform vec3 uColor;
uniform sampler2D uMainTex;

varying vec2 vUv;
varying vec3 vWorldNormal;

#include <common>
#include <lights_pars_begin>

void main() {
  float nl = 0.0;

  #if NUM_DIR_LIGHTS > 0
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(directionalLights[0].direction);
    nl = max(0.0, dot(N, L));
  #endif

  if (nl <= 0.01) nl = 0.3;
  else if (nl <= 0.3) nl = 0.5;
  else nl = 1.0;

  vec4 col = vec4(uColor, 1.0);
  col *= texture2D(uMainTex, vUv);
  col.rgb *= nl;

  gl_FragColor = col;

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

  static WHITE_TEX = (() => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  })();

  constructor({ color = new THREE.Color(0xffffff), map = null } = {}) {
    super({
      vertexShader: CustomToonMaterial.VERT_SHADER,
      fragmentShader: CustomToonMaterial.FRAG_SHADER,
      lights: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          uColor: {
            value: color,
          },
          uMainTex: {
            value: map ?? CustomToonMaterial.WHITE_TEX,
          },
        },
      ]),
    });
  }
}
