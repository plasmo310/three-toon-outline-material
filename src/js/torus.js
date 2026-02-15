import * as THREE from "three";
import { CustomToonMaterial } from "./material/toon-material.js";
import {
  CustomOutlineMaterial,
  embedSoftNormalAttribute,
} from "./material/outline-material.js";

/**
 * Torus
 */
export class Torus {
  constructor() {
    // create root.
    this.root = new THREE.Group();
    this.root.name = "Torus";

    const geometry = new THREE.TorusGeometry(1.5, 0.5, 128, 128);

    // create outline mesh.
    let outlineGeometry = geometry.clone();
    outlineGeometry = embedSoftNormalAttribute(outlineGeometry);
    this.outlineMaterial = new CustomOutlineMaterial({
      color: new THREE.Color(0xffffff),
      width: 0.075,
      useSoftNormal: true,
    });
    this.outlineMesh = new THREE.Mesh(outlineGeometry, this.outlineMaterial);
    this.outlineMesh.frustumCulled = false;

    // create mesh.
    this.mainMaterial = new CustomToonMaterial({
      color: new THREE.Color(0x0000ff),
    });
    this.mainMesh = new THREE.Mesh(geometry, this.mainMaterial);

    // add root.
    this.root.clear();
    this.root.add(this.outlineMesh);
    this.root.add(this.mainMesh);
  }

  onUpdate(deltaTime) {
    // rotate.
    this.root.rotation.x += 1 * deltaTime;
    this.root.rotation.y += 1 * deltaTime;
  }

  setVisibleOutline(isVisible) {
    this.outlineMesh.visible = isVisible;
  }

  setOutlineWidth(width) {
    this.outlineMaterial.setOutlineWidth(width);
  }
}
