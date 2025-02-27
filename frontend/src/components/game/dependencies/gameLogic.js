import * as THREE from "three";

import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";

import { FBXLoader } from 'FBXLoader';
import { Sky } from 'Sky';
// from '../../../build/three.module.js';

export function initPingPongGame() {
  console.log("in initGame");
  var WIDTH = 700,
    HEIGHT = 500,
    VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000,
    FIELD_WIDTH = 1200,
    FIELD_LENGTH = 3000,
    BALL_RADIUS = 20,
    PADDLE_WIDTH = 200,
    PADDLE_HEIGHT = 30;
  // Create a canvas element and add it to the document body
  const canvasDiv = document.getElementById("canvasDiv");
  let canvas = document.createElement("canvas"); // Create a canvas element
  let gameBlock = canvasDiv.appendChild(canvas);
  canvas.width = canvasDiv.clientWidth;
  canvas.height = canvasDiv.clientHeight;
  if (gameBlock == null) console.log("still not created");
  const renderer = new THREE.WebGLRenderer({ canvas: gameBlock });
  renderer.setSize(gameBlock.width, gameBlock.height);
  const camera = new THREE.PerspectiveCamera(
    45,
    gameBlock.width / gameBlock.height,
    0.1,
    1000
  );
  camera.position.set(0, 200, 400);
  camera.lookAt(0, 120, 0);
  const scene = new THREE.Scene();
  // Load the texture
  const backgroundloader = new THREE.TextureLoader();
  backgroundloader.load(
    "./assets/control-table-spacecraft.jpg",
    function (texture) {
      // Set the texture as the scene background
      scene.background = texture;
    }
  );

  // Load FBX model
  const ALIENLoader = new FBXLoader();
  ALIENLoader.load(
    "./assets/source/ALIEN.fbx",
    function (fbx) {
      fbx.scale.set(100, 100, 100); // Scale down the model if necessary
      scene.add(fbx);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

// gameLogic.js

export function initGame() {
  // Initialize game elements, assets, etc.
  console.log("Initializing game...");
}

export function startGame() {
  const canvas = document.getElementById("gameCanvas");

  // Example game loop or basic drawing
  function gameLoop() {
    console.log("game loop");

    // Game logic goes here (e.g., rendering, physics, inputs)
    // ctx.fillRect(10, 10, 50, 50); // Example drawing

    requestAnimationFrame(gameLoop);
  }

  gameLoop(); // Start the game loop
}
