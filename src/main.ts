import {vec3, vec4} from 'gl-matrix';
import Stats from 'stats-js';
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Cube from './geometry/Cube';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

//import lambertVertSource from './shaders/lambert-vert.glsl?raw';
import lambertVertSource from './shaders/custom-vert.glsl?raw';
//import lambertFragSource from './shaders/lambert-frag.glsl?raw';
import lambertFragSource from './shaders/custom-frag.glsl?raw';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
//const controls = {
  //tesselations: 5,
  //'Load Scene': loadScene, // A function pointer, essentially
//};

const controls = {
  color: [255, 0, 0]
};

let time = 0;

let cube: Cube;

let defColor = vec4.fromValues(1, 0, 0, 1);

function loadScene() {
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  
  const gui = new DAT.GUI();
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, lambertVertSource),
    new Shader(gl.FRAGMENT_SHADER, lambertFragSource),
  ]);

  // This function will be called every frame
  function tick() {
    time += .001;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
   
    let color3 = vec3.fromValues(controls.color[0], controls.color[1], controls.color[2]);
    vec3.normalize(color3, color3);
    let color4 = vec4.fromValues(color3[0], color3[1], color3[2], 1);
    renderer.render(camera, lambert, [cube], color4, time);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
