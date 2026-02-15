import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MainScene } from "./main-scene.js";

/**
 * Main Application
 */
class MainApp {
  GUI_PARAM = {
    useOutline: true,
    outlineWidth: 0.05,
  };

  constructor(container) {
    // check container.
    if (!container) {
      console.log("not found MainApp container.");
      return;
    }
    this.container = container;

    // check available WebGL.
    if (!WebGL.isWebGL2Available()) {
      this.container.appendChild(WebGL.getWebGLErrorMessage());
      return;
    }

    // register gui parameters.
    const gui = new GUI();
    gui.add(this.GUI_PARAM, "useOutline").onChange(() => {
      this.main_scene.torus.setVisibleOutline(this.GUI_PARAM.useOutline);
    });
    gui.add(this.GUI_PARAM, "outlineWidth", 0.01, 0.5, 0.01).onChange(() => {
      this.main_scene.torus.setOutlineWidth(this.GUI_PARAM.outlineWidth);
    });

    // create clock.
    this.clock = new THREE.Clock();

    // create scene.
    this.main_scene = new MainScene(this.width, this.height);

    // create renderer and append to DOM.
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setAnimationLoop(() => {
      const deltaTime = this.clock.getDelta();
      this.onUpdate(deltaTime);
    });
    this.container.appendChild(this.renderer.domElement);

    // create controls.
    this.orbit_controls = new OrbitControls(
      this.main_scene.camera,
      this.renderer.domElement,
    );

    // register resize event.
    this.onWindowResize(this.width, this.height);
    window.addEventListener("resize", () =>
      this.onWindowResize(this.width, this.height),
    );
  }

  get width() {
    return this.container.clientWidth;
  }

  get height() {
    return this.container.clientHeight;
  }

  onUpdate(deltaTime) {
    // update scene.
    this.main_scene.onUpdate(deltaTime);

    // update controls.
    this.orbit_controls.update(deltaTime);

    // execute render.
    this.renderer.render(this.main_scene.scene, this.main_scene.camera);
  }

  onWindowResize(width, height) {
    // resize renderer.
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // notify window resize.
    this.main_scene.onWindowResize(width, height);
  }
}

window.addEventListener("load", () => {
  const container = document.getElementById("container");
  new MainApp(container);
});
