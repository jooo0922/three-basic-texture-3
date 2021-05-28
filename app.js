'use strict';

import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

import {
  GUI
} from 'https://cdn.skypack.dev/dat.gui';

function main() {
  const canvas = document.querySelector('#canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas
  });

  // camera
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  // scene
  const scene = new THREE.Scene();

  // box geometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // load texture and create material using it
  const cubes = [];
  const loader = new THREE.TextureLoader();

  // texture의 repeat, offset, center, rotation, wrap 등의 property를 gui에서 입력값을 받아 수정하기 위해서 따로 만들어놓음.
  const texture = loader.load('./image/wall.jpg');
  const material = new THREE.MeshBasicMaterial({
    map: texture
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);

  // 간단한 헬퍼 클래스를 만들어 degree 단위로 값을 입력받으면 알아서 radian 단위로 변환해서 texture.rotation에 할당해줄 수 있도록 함.
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }

    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }

    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  // dat.GUI는 값을 문자열로 넘겨주기 때문에 texture.wrapS,T같은 enum값을 지정할 때 숫자형만 받으므로
  // parseFloat()을 이용하여 문자열을 숫자로 변환하는 헬퍼 클래스를 만든 거임.
  class StringToNumberHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }

    get value() {
      return this.obj[this.prop];
    }

    set value(v) {
      this.obj[this.prop] = parseFloat(v);
    }
  }

  // texture.wrapS,T는 '어떻게' 반복학 것이냐(반복 유형), texture.repeat.x,y는 x 또는 y축으로 '얼마나' 반복할 것이냐(반복 횟수)를 각각 결정하는 값.
  const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  };

  // texture.wrapS,T 속성을 변경하려면 texture.needsUpdate를 true로 먼저 설정해줘야 함. 나머지 property들은 상관없음.
  function updateTexture() {
    texture.needsUpdate = true;
  }

  const gui = new GUI(); // dat.GUI 라이브러리에서 가져온 GUI 클래스의 새로운 인스턴스를 만들어서 할당해놓음.
  gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
    .name('texture.wrapS')
    .onChange(updateTexture);
  gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
    .name('texture.wrapT')
    .onChange(updateTexture);
  gui.add(texture.repeat, 'x', 0, 5, 0.01).name('texture.repeat.x');
  gui.add(texture.repeat, 'y', 0, 5, 0.01).name('texture.repeat.y');
  gui.add(texture.offset, 'x', -2, 2, 0.01).name('texture.offset.x');
  gui.add(texture.offset, 'y', -2, 2, 0.01).name('texture.offset.y');
  gui.add(texture.center, 'x', -0.5, 1.5, 0.01).name('texture.center.x');
  gui.add(texture.center, 'y', -0.5, 1.5, 0.01).name('texture.center.y');
  gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360).name('texture.rotation');

  // resize
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function animate(t) {
    t *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, index) => {
      const speed = 0.2 + index * 0.1;
      const rotate = t * speed;
      cube.rotation.x = rotate;
      cube.rotation.y = rotate;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

main();