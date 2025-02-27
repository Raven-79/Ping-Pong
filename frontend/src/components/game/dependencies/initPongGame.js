import * as THREE from 'three';
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { FBXLoader } from 'FBXLoader';
import { Sky } from 'Sky';
// from '../../../build/three.module.js';

export function initPongGame() {
  let tableScale = 6;
  console.log("in initGame");
  // Create a canvas element and add it to the document body
  const canvasDiv = document.getElementById("canvasDiv");
  let canvas = document.createElement("canvas"); // Create a canvas element
  let gameBlock = canvasDiv.appendChild(canvas);
  canvas.width = canvasDiv.clientWidth;
  canvas.height = canvasDiv.clientHeight;
  if (gameBlock == null) console.log("still not created");
  const renderer = new THREE.WebGLRenderer({
    canvas: gameBlock,
  });
  renderer.setSize(gameBlock.width, gameBlock.height);
  renderer.shadowMap.enabled = true;
  const camera = new THREE.PerspectiveCamera(
    70,
    gameBlock.width / gameBlock.height,
    0.1,
    1000
  );
  camera.position.set(0, 128, 185);
  camera.aspect = canvas.width / canvas.height;
  // camera.lookAt(0, 120, -120);
  const scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);
  const lightAmbient = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(lightAmbient);
  const loader = new GLTFLoader();
  let rotatingModel; // Variable to store the reference to the model

  loader.load(
    "./assets/source/inside_galaxy_skybox/scene.gltf",
    function (gltf) {
      scene.add(gltf.scene);
      const model = gltf.scene;

      // Set the size by scaling the model
      model.scale.set(500, 500, 500); // Adjust the values to resize (x, y, z)

      // Rotate the model 90 degrees on the X, Y, or Z axis
      // model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      model.position.set(0, 0, 0);
      // Traverse the scene to find specific objects (paddles and balls)
      // Store the model for later rotation
      rotatingModel = model;
      // model.traverse(function (child) {
      //     if (child.isMesh) {
      //         console.log(child.name)
      //         // Check the names of the objects (you can inspect the names in a 3D viewer or console)
      //         if (child.name === 'Ping_Pong_Racket_Ping_Pong_Racket_5828') {
      //             // Move the first paddle
      //             child.position.set(1, 0, 0); // Adjust the x, y, z values as needed
      //         } else if (child.name === 'Ping_Pong_Racket_Ping_Pong_Racket_5828001') {
      //             // Move the second paddle
      //             child.position.set(-1, 0, 0); // Adjust the x, y, z values as needed
      //         } else if (child.name === '_Revolve_4284') {
      //             // Move the first ball
      //             child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
      //         }
      //         else if (child.name === '_Revolve_4310') {
      //             // Move the first ball
      //             child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
      //         }
      //         else if (child.name === '_Revolve_4298') {
      //             // Move the first ball
      //             child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
      //         }
      //         // Similarly, you can find and move Ball2, Ball3, etc.
      //     }
      // });
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  loader.load(
    "./assets/source/wall_of_the_spaceship/scene.gltf",
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);
      // Set the size by scaling the model
      model.scale.set(55, 55, 55); // Adjust the values to resize (x, y, z)

      // Rotate the model 90 degrees on the X, Y, or Z axis
      model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      // model.position.set(0, 120, -150);
      model.position.set(0, 120, -280);
      // Traverse through the model to find meshes and their colors
      model.traverse(function (child) {
        if (child.isMesh) {
          console.log("Mesh Name:", child.name); // Print mesh name (if available)
          if (child.material) {
            if (Array.isArray(child.material)) {
              // If there are multiple materials applied to the mesh
              child.material.forEach((mat, index) => {
                if (mat.color) {
                  console.log(`Material ${index} Color:`, mat.color);
                } else {
                  console.log(
                    `Material ${index} does not have a color property`
                  );
                }
              });
            } else {
              // Single material case
              if (child.material.color) {
                console.log("Material Color:", child.material.color);
              } else {
                console.log("Material does not have a color property");
              }
            }
          } else {
            console.log("Mesh has no material");
          }
        }
      });
      const model2 = gltf.scene.clone();

      // Set the size by scaling the model2
      model2.scale.set(55, 55, 55); // Adjust the values to resize (x, y, z)

      // Rotate the model2 90 degrees on the X, Y, or Z axis
      model2.rotation.y = 0; // Rotate 90 degrees on the Y axis
      model2.position.set(-250, 120, -50);
      scene.add(model2);
      const model3 = gltf.scene.clone();

      // Set the size by scaling the model3
      model3.scale.set(55, 55, 55); // Adjust the values to resize (x, y, z)

      // Rotate the model3 90 degrees on the X, Y, or Z axis
      model3.rotation.y = Math.PI / 2 + Math.PI / 2; // Rotate 90 degrees on the Y axis
      model3.position.set(250, 120, -50);
      scene.add(model3);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  let tableModel;

  // loader.load('./assets/source/day_6_video_game/scene.gltf', function (gltf) {

  //     scene.add(gltf.scene);
  //     const model = gltf.scene;

  //     // Set the size by scaling the model
  //     model.scale.set(4, 4, 4); // Adjust the values to resize (x, y, z)
  //     // Rotate the model 90 degrees on the X, Y, or Z axis
  //     model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
  //     model.position.set(0, 120, 120);
  //     // Traverse the scene to find specific objects (paddles and balls)
  //     tableModel = model;
  //     if (tableModel) {
  //         tableModel.traverse(function (child) {
  //             if (child.isMesh && child.material && child.material.color) {
  //                 // console.log(child.name);
  //                 if (child.material.color.isColor === true &&
  //                     child.name == 'Object_8') {
  //                     // child.position.set(0, -80, 0);
  //                     console.log(child.position);
  //                     if (child.geometry) child.geometry.dispose();
  //                     if (child.material) child.material.dispose();
  //                     tableModel.remove(child);
  //                 }
  //             }
  //         });
  //     }
  // }, undefined, function (error) {

  //     console.error(error);

  // });

  loader.load(
    "./assets/source/day_6_video_game/scene.gltf",
    function (gltf) {
      const model = gltf.scene;

      // Set the size by scaling the model
      model.scale.set(tableScale, tableScale, tableScale); // Adjust the values to resize (x, y, z)
      // Rotate the model 90 degrees on the X, Y, or Z axis
      model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      model.position.set(0, 65, 57);
      // Traverse the scene to find specific objects (paddles and balls)
      tableModel = model;
      tableModel.castShadow = true; //default is false
      tableModel.receiveShadow = true; //default
      if (tableModel) {
        tableModel.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true; //default is false
            child.receiveShadow = true; //default
            // console.log(child.name);
            if (child.name == "Object_4") {
              console.log("score back");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_6") {
              console.log("score front");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_8") {
              console.log("the pong table");
              // child.position.set(0, 6, 0);
            }
            if (child.name == "Object_10") {
              console.log("limits between players");
              // child.position.set(0, 6, 0);
            }
            if (child.name == "Object_12") {
              console.log("this is the back paddle");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_14") {
              console.log("this is the front paddle");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_16") {
              console.log("this is the ball");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_18") {
              console.log("this is white borders");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_20") {
              console.log("red words");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_22") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_23") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_24") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_25") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_26") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_28") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_29") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_30") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_32") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_34") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_35") {
              console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_36") {
              console.log("left purple");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_37") {
              console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_38") {
              console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_39") {
              console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_40") {
              console.log("play back");
              // child.position.set(0, -10, 0);
            }
            if (child.name == "Object_41") {
              console.log("red button back");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_42") {
              console.log("cyrcile of the red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_44") {
              console.log("play front");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_45") {
              console.log("red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_46") {
              console.log("cyrcile of the red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_48") {
              child.castShadow = true; //default is false
              child.receiveShadow = true; //default
              console.log("the big table");
              console.log(child);
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_50") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name == "Object_52") {
              console.log("uknown");
              // child.position.set(0, 10, 0);
            }
          }
        });
      }
      tableModel.castShadow = true; //default is false
      tableModel.receiveShadow = true; //default
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Optional, for smooth damping effect
  controls.dampingFactor = 0.25; // Optional, for damping effect
  controls.screenSpacePanning = false; // Whether to enable panning
  // controls.target.set(0, 76 + (120 - 76) / 2, 100);
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1000, 1000, 1000); //change light posistion later
  light.castShadow = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
  scene.add(light);
  //Set up shadow properties for the light
  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 500; // default

  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  light2.position.set(-1000, 1000, 1000); //change light2 posistion later
  light2.castShadow = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
  scene.add(light2);

  // Add the floor
  const floorGeometry = new THREE.PlaneGeometry(600, 600); // Large plane for the floor
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      0.06353375545877023,
      0.17683924545207097,
      0.2438378681299503
    ),
  }); // Grey material
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate the plane to make it horizontal
  floor.position.set(0, -18, 0); // Set the position to be at y = 0 (ground level)
  floor.receiveShadow = true; // Allow floor to receive shadows
  scene.add(floor);

  loader.load(
    "./assets/source/bmo_adventure_time/scene.gltf",
    function (gltf) {
      console.log("***************************************");
      const model = gltf.scene;
      // Scale and position the model
      model.scale.set(15, 15, 15); // Adjust the scaling if the model is too small or too large
      model.position.set(-30, 75, -15); // Set the position in the center
      model.rotation.y = Math.PI / 2 + Math.PI / 5;
      // Debug: Traverse through the model to check for meshes and materials
      model.traverse(function (child) {
        if (child.isMesh) {
          console.log("Mesh Name:", child.name); // Print mesh name (if available)
          if (child.material) {
            console.log("Material:", child.material); // Check if the material is loaded properly
          } else {
            console.log("Mesh has no material");
          }
        }
      });
      scene.add(model); // Add the model to the scene
      const model2 = model.clone();
      model2.scale.set(15, 15, 15); // Adjust the scaling if the model2 is too small or too large
      model2.position.set(40, 75, 130); // Set the position in the center
      model2.rotation.y = Math.PI + Math.PI / 5;
      scene.add(model2);
    },
    undefined,
    function (error) {
      console.error("Error loading the model:", error); // Log any errors
    }
  );
  let rotationSpeed = THREE.MathUtils.degToRad(1) / 25;
  function animate() {
    requestAnimationFrame(animate);
    if (rotatingModel) {
      // Rotate the model by 1 degree (converted to radians) each frame
      rotatingModel.rotation.y += rotationSpeed; // 0.5 degree per frame
    }
    controls.update();
    // console.log(camera.position)
    renderer.render(scene, camera);
  }
  window.addEventListener("resize", () => {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
    // // Dynamically adjust the camera's z-position relative to canvas dimensions
    // const aspectRatio = camera.aspect;  // The width-to-height ratio of the camera
    // const cameraDistance = 292 * (canvas.height / 600);  // Adjust the '292' based on your needs and canvas size

    // // Set the camera position based on the calculated distance
    // camera.position.set(0, 230, cameraDistance);
    // camera.lookAt(0, 120, 0);
    // windowMiddle = window.innerWidth / 2;
  });
  animate();
  renderer.domElement.addEventListener("mousedown", (event) => {
    console.log(controls.target);
    console.log(camera);
    console.log("===========================================================");
  });
}
