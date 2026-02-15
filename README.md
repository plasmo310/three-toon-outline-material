# three-toon-outline-material

* Three.js用のトゥーン+背面法アウトラインマテリアルです。
  * <a href="/src/js/material/outline-material.js">CustomOutlineMaterial</a>
  * <a href="/src/js/material/toon-material.js">CustomToonMaterial</a>

<img width="480px;" src="/ReadMeContents/01_toon_outline_material.png" >

## 使い方サンプル

* アウトライン用のメッシュを別に用意し、そちらに`CustomOutlineMaterial`を設定してください。
  * 重ねるメッシュのマテリアルは任意ですが、カスタムのトゥーン描画マテリアルも`CustomToonMaterial`として用意しています。
* ハードエッジの輪郭線が途切れてしまう問題対処のため、ソフトエッジ計算用の関数も用意しています。
  * 使用する場合、マテリアルの`useSoftNormal`パラメータをtrueにして設定してください。
  * `embedSoftNormalAttribute`関数にGeometryを渡すとソフトエッジ情報が設定されます。
* 具体的な実装サンプルとしては、<a href="/src/js/torus.js">/src/js/torus.js</a> をご参照ください。

```
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

・・・

}
```
