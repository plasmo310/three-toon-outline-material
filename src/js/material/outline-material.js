import * as THREE from "three";

/**
 * Custom Outline Material
 */
export class CustomOutlineMaterial extends THREE.ShaderMaterial {
  static VERT_SHADER = `
uniform float uOutlineWidth;

#ifdef USE_SOFT_NORMAL
attribute vec3 softNormal;
#endif

void main() {
#ifdef USE_SOFT_NORMAL
  vec3 N = normalize(softNormal);
#else
  vec3 N = normalize(normal);
#endif

  vec3 displaced = position + N * uOutlineWidth;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

  static FRAG_SHADER = `
uniform vec3 uOutlineColor;

void main() {
  gl_FragColor = vec4(uOutlineColor, 1.0);
}
`;

  constructor({
    color = new THREE.Color(0x66aaff),
    width = 0.05,
    useSoftNormal = false,
  } = {}) {
    super({
      vertexShader: CustomOutlineMaterial.VERT_SHADER,
      fragmentShader: CustomOutlineMaterial.FRAG_SHADER,
      side: THREE.BackSide,
      uniforms: {
        uOutlineColor: {
          value: color,
        },
        uOutlineWidth: {
          value: width,
        },
      },
    });

    // add define USE_SOFT_NORMAL.
    if (useSoftNormal) {
      this.defines = {
        ...(this.defines ?? {}),
        USE_SOFT_NORMAL: 1,
      };
    }
  }

  setOutlineWidth(width) {
    this.uniforms.uOutlineWidth.value = width;
  }
}

/**
 * calculate and embed soft normal attribute.
 */
export function embedSoftNormalAttribute(
  geometry,
  tolerance = 1e-4,
  attrName = "softNormal",
) {
  if (!geometry.getAttribute("position"))
    throw new Error("position attribute not found.");
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();

  const pos = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");

  const inv = 1.0 / tolerance;

  const groups = new Map();
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);

    const kx = Math.round(p.x * inv);
    const ky = Math.round(p.y * inv);
    const kz = Math.round(p.z * inv);
    const key = `${kx},${ky},${kz}`;

    let g = groups.get(key);
    if (!g) {
      g = { sum: new THREE.Vector3(), indices: [] };
      groups.set(key, g);
    }

    n.fromBufferAttribute(normal, i);
    g.sum.add(n);
    g.indices.push(i);
  }

  const data = new Float32Array(pos.count * 3);

  for (const g of groups.values()) {
    const avg = g.sum.clone().normalize();
    for (const i of g.indices) {
      const o = i * 3;
      data[o + 0] = avg.x;
      data[o + 1] = avg.y;
      data[o + 2] = avg.z;
    }
  }

  geometry.setAttribute(attrName, new THREE.BufferAttribute(data, 3));
  geometry.attributes[attrName].needsUpdate = true;

  return geometry;
}
