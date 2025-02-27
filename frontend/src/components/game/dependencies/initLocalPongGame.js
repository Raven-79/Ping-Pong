import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { FBXLoader } from "FBXLoader";
import { myFetch, BACKEND_URL } from "../../../utils/apiRequest.js";

// import * as THREE from '../../../../node_modules/three/build/three.module.js';
// import { OrbitControls } from '../../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from '../../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from "../../../../node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "../../../../node_modules/three/examples/jsm/geometries/TextGeometry.js";
// import { FBXLoader } from '../../../../node_modules/three/examples/jsm/loaders/FBXLoader.js';
// import { Sky } from '../../../../node_modules/three/examples/jsm/objects/Sky.js';

// from '../../../build/three.module.js';

export function initLocalPongGame() {
  let vitesse = 1000;
  let score1 = 0;
  let score2 = 0;

  // Create the geometry for the ball (a cube)
  const ballGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // A cube (1x1x1)
  const ballMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }); // Yellow color
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 65, 0);

  // Create the geometry for the paddles (rectangular parallelepiped)
  const paddleGeometry = new THREE.BoxGeometry(6, 1.5, 1); // Narrow and tall for paddles
  const paddleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }); // Green color

  // Left paddle
  const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  // Position it on the left side
  paddle.position.set(0, 65, 25);

  // Right paddle
  const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
  // Position it on the right side
  paddle2.position.set(0, 65, -25);
  ////////////////////////////////////
  // ading all gemitrics values to a single object for sending it to the backend
  let game_start = false;
  let player = null;
  let opponent = null;
  // let socket = new WebSocket('ws://localhost:8000/ws/game/');
  let mouseXupdate = null;
  let mouseX = null;
  let socketIsOpen = false;
  let socket = null;
  // Create the loading screen overlay
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.style.position = "absolute";
  loadingOverlay.style.top = "0";
  loadingOverlay.style.left = "0";
  loadingOverlay.style.width = "100%";
  loadingOverlay.style.height = "100%";
  loadingOverlay.style.background = "rgba(0, 0, 0, 0.8)";
  loadingOverlay.style.display = "flex";
  loadingOverlay.style.flexDirection = "column";
  loadingOverlay.style.alignItems = "center";
  loadingOverlay.style.justifyContent = "center";
  loadingOverlay.style.color = "white";
  loadingOverlay.innerHTML = `
    <img src="img/matching.png" alt="Searching" style="width: 100px; height: 100px; margin-bottom: 20px;">
    <h5>Searching the galaxy for your perfect opponent... Hold tight, astronaut!</h5>
  `;
  // document.body.appendChild(loadingOverlay);

  // Fetch user data
  myFetch(`${BACKEND_URL}/manage/profile/`)
    .then((response) => response.json())
    .then((userData) => {
      // console.log(userData);
      let accessToken = localStorage.getItem("access_token");
      console.log(`token=${accessToken}`);
      socket = new WebSocket(
        `ws://127.0.0.1:8000/ws/game/local/123/?user_id=${userData.user}`
      );
      socket.onopen = () => {
        console.log("WebSocket is open now.");
        socketIsOpen = true;
        // Start the animation loop once WebSocket is open
        // animate();
      };
      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        // console.log("Message from server:", data);
        if (data.type === "mouse_move") {
          // Update the paddle's position based on the server's response
          // console.log("Update the paddle's position based on the server's response")
          paddle.position.x = data.new_position;
          console.log(paddle.position.x);
        } else if (data.type === "rendring") {
          // // Update ball and paddle positions
          console.log(data);
          ball.position.x = data.ball_position.x;
          ball.position.z = data.ball_position.z;
          ball.$velocity.x = data.ball_velocity.x;
          ball.$velocity.z = data.ball_velocity.z;
        } else if (data.type === "game_start") {
          this.$updateState({ loading: false });
          console.log("Message from server:", data);
          ball.position.set(
            data.message.ball_position.x,
            ball.position.y,
            data.message.ball_position.z
          );
          // Position the paddle on the table
          // paddle.rotation.y = Math.PI / 2;
          paddle.position.set(
            data.message.paddle1_position.x,
            data.message.paddle1_position.y,
            data.message.paddle1_position.z
          ); // Adjust the position as needed
          console.log(paddle.position);

          // paddle2.rotation.y = Math.PI / 2;
          paddle2.position.set(
            data.message.paddle2_position.x,
            data.message.paddle2_position.y,
            data.message.paddle2_position.z
          ); // Adjust the position as needed

          game_start = true;
          player = data.player;
          if (player === data.message.player1) opponent = data.message.player2;
          else opponent = data.message.player1;
          // console.log(`player: ${player}`);
          // console.log(`opponent: ${opponent}`);
        } else if (data.type === "update_game_state") {
          // console.log(data);
          if (data.message.username === player) {
            ball.position.x = data.message.shared_state.ball_position.x;
            ball.position.z = data.message.shared_state.ball_position.z;
            if (player === data.message.shared_state.player1) {
              if (
                score1 !== data.message.shared_state.score1 &&
                data.message.shared_state.score1 != null
              ) {
                score1 = data.message.shared_state.score1;
                updateScore(1);
              }
              if (
                score2 !== data.message.shared_state.score2 &&
                data.message.shared_state.score2 != null
              ) {
                score2 = data.message.shared_state.score2;
                updateScore(2);
              }
            } else if (player === data.message.shared_state.player2) {
              if (
                score1 !== data.message.shared_state.score2 &&
                data.message.shared_state.score2 != null
              ) {
                score1 = data.message.shared_state.score2;
                updateScore(1);
              }
              if (
                score2 !== data.message.shared_state.score1 &&
                data.message.shared_state.score1 != null
              ) {
                score2 = data.message.shared_state.score1;
                updateScore(2);
              }
            }
          } else if (data.message.username === opponent) {
            ball.position.x = -data.message.shared_state.ball_position.x;
            ball.position.z = -data.message.shared_state.ball_position.z;
            if (opponent === data.message.shared_state.player1) {
              if (
                score2 !== data.message.shared_state.score1 &&
                data.message.shared_state.score1 != null
              ) {
                score2 = data.message.shared_state.score1;
                updateScore(2);
              }
              if (
                score1 !== data.message.shared_state.score2 &&
                data.message.shared_state.score2 != null
              ) {
                score1 = data.message.shared_state.score2;
                updateScore(1);
              }
            } else if (opponent === data.message.shared_state.player2) {
              if (
                score2 !== data.message.shared_state.score2 &&
                data.message.shared_state.score2 != null
              ) {
                score2 = data.message.shared_state.score2;
                updateScore(2);
              }
              if (
                score1 !== data.message.shared_state.score1 &&
                data.message.shared_state.score1 != null
              ) {
                score1 = data.message.shared_state.score1;
                updateScore(1);
              }
            }
          }
          // console.log(score1, ":", score2);
        } else if (data.type === "paddle_position") {
          // console.log(data)
          if (data.message.username === player) {
            if (player === data.message.paddle_state.player1)
              paddle.position.x = data.message.paddle_state.player1_pos.x;
            else if (player === data.message.paddle_state.player2)
              paddle.position.x = data.message.paddle_state.player2_pos.x;
            // paddle.position.x = data.message.paddle_state.player.x;
          }
          //     paddle.position.x = data.paddle_state.player.x;
          else if (data.message.username === opponent) {
            if (opponent === data.message.paddle_state.player1)
              paddle2.position.x = -data.message.paddle_state.player1_pos.x;
            else if (opponent === data.message.paddle_state.player2)
              paddle2.position.x = -data.message.paddle_state.player2_pos.x;
          }
          //     paddle.position.x = data.paddle_state.opponent.x;
        } else if (data.type === "game_over") {
          this.$updateState({ gameOver: true });
          if (data.message.username === player) {
            if (data.message.shared_state.winer === player) {
              console.log(
                `the winer is ${player} and the loser is ${opponent}`
              );
            } else if (data.message.shared_state.winer === opponent) {
              console.log(
                `the winer is ${opponent} and the loser is ${player}`
              );
            }
          } else if (data.message.username === opponent) {
            if (data.message.shared_state.winer === player) {
              console.log(
                `the winer is ${player} and the loser is ${opponent}`
              );
            } else if (data.message.shared_state.winer === opponent) {
              console.log(
                `the winer is ${opponent} and the loser is ${player}`
              );
            }
          }
        }
      };
      socket.onclose = () => {
        console.log("WebSocket connection closed.");
        socketIsOpen = false;
      };
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socketIsOpen = false;
      };
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
    });

  let tableScale = 3;
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
    75,
    gameBlock.width / gameBlock.height,
    0.1,
    1000
  );
  camera.position.set(0, 80, 50);
  camera.aspect = canvas.width / canvas.height;
  camera.lookAt(0, 80, -38);
  const camera2 = new THREE.PerspectiveCamera(
    75,
    gameBlock.width / gameBlock.height,
    0.1,
    1000
  );
  camera2.position.set(0, 80, -50);
  camera2.aspect = canvas.width / canvas.height;
  camera2.lookAt(0, 80, -38);
  const scene = new THREE.Scene();
  // Load the font and create the 3D text
  const textloader = new FontLoader();
  let score1Mesh = null;
  let score2Mesh = null;
  let ScoreFont = null;
  textloader.load(
    "./assets/source/modes/Pong_Score_Regular.json",
    function (loadedFont) {
      ScoreFont = loadedFont;
      const textGeometry = new TextGeometry("00", {
        font: loadedFont,
        size: 2,
        depth: 0.5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      // Create a material for the text
      const textMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });

      // Create the mesh from the geometry and material
      score1Mesh = new THREE.Mesh(textGeometry, textMaterial);
      score1Mesh.position.set(13.5, 65, -8.9);
      score1Mesh.scale.set(1.5, 1, 1);
      score1Mesh.rotation.z = -Math.PI / 2;
      score1Mesh.rotation.x = -Math.PI / 2;
      scene.add(score1Mesh);
      score2Mesh = new THREE.Mesh(textGeometry, textMaterial);
      score2Mesh.position.set(13.5, 65, 2.5);
      score2Mesh.scale.set(1.5, 1, 1);
      score2Mesh.rotation.z = -Math.PI / 2;
      score2Mesh.rotation.x = -Math.PI / 2;
      scene.add(score2Mesh);
    }
  );

  // Function to format the score as a two-digit string
  function formatScore(score) {
    return score < 10 ? "0" + score : score.toString();
  }

  // Function to create score text
  function createScoreText(score) {
    const formattedScore = formatScore(score); // Format the score
    const textGeometry = new TextGeometry(formattedScore, {
      font: ScoreFont,
      size: 2,
      depth: 0.5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    return new THREE.Mesh(textGeometry, textMaterial);
  }

  // Function to update score
  function updateScore(score) {
    if (score === 1 && score1 !== null) {
      scene.remove(score1Mesh); // Remove old score mesh
      score1Mesh = createScoreText(score1); // Create new mesh
      score1Mesh.rotation.z = -Math.PI / 2; // Reapply rotation
      score1Mesh.rotation.x = -Math.PI / 2;
      score1Mesh.position.set(13.5, 65, -8.9);
      scene.add(score1Mesh); // Add new mesh to scene
    } else if (score === 2 && score2 !== null) {
      scene.remove(score2Mesh); // Remove old score mesh
      score2Mesh = createScoreText(score2); // Create new mesh
      score2Mesh.rotation.z = -Math.PI / 2; // Reapply rotation
      score2Mesh.rotation.x = -Math.PI / 2;
      score2Mesh.position.set(13.5, 65, 2.5);
      scene.add(score2Mesh); // Add new mesh to scene
    }
  }
  // Add objects to the scene
  scene.add(ball);
  scene.add(paddle);
  scene.add(paddle2);
  const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);
  const lightAmbient = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(lightAmbient);
  const loader = new GLTFLoader();
  let rotatingModel; // Variable to store the reference to the model

  loader.load(
    "./assets/source/inside_galaxy_skybox/scene.gltf",
    function (gltf) {
      // scene.add(gltf.scene);
      const model = gltf.scene;

      // Set the size by scaling the model
      model.scale.set(500, 500, 500); // Adjust the values to resize (x, y, z)

      // Rotate the model 90 degrees on the X, Y, or Z axis
      // model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      model.position.set(0, 0, 0);
      // Traverse the scene to find specific objects (paddles and balls)
      // Store the model for later rotation
      rotatingModel = model;
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  // light2.position.set(-100, 1000, 1000); //change light2 posistion later
  light2.castShadow = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
  scene.add(light2);
  light2.position.set(0, 150, 100);
  loader.load(
    "./assets/source/sci-fi_spaceship_bridge/scene.gltf",
    function (gltf) {
      // scene.add(gltf.scene); //  ++++++
      const model = gltf.scene;

      // Set the size by scaling the model
      model.scale.set(30, 30, 30); // Adjust the values to resize (x, y, z)
      // Rotate the model 90 degrees on the X, Y, or Z axis
      // model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      model.position.set(0, 100, -257);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  let tableModel;
  loader.load(
    "./assets/source/day_6_video_game/scene.gltf",
    function (gltf) {
      const model = gltf.scene;

      // Set the size by scaling the model
      model.scale.set(tableScale, tableScale, tableScale); // Adjust the values to resize (x, y, z)
      // Rotate the model 90 degrees on the X, Y, or Z axis
      model.rotation.y = -Math.PI / 2; // Rotate 90 degrees on the Y axis
      model.position.set(0, 65, 0);
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
            if (child.name === "Object_4") {
              // console.log("score back");
              // child.position.set(0, 0, 0);
            }
            if (child.name === "Object_6") {
              // console.log("score front");
              // child.position.set(0, 0, 0);
            }
            if (child.name === "Object_8") {
              // console.log("the pong table");
              // child.position.set(0, 6, 0);
            }
            if (child.name === "Object_10") {
              // console.log("limits between players");
              child.position.set(0, -1, 0);
            }
            if (child.name === "Object_12") {
              // console.log("this is the back paddle");
              // paddle2.rotation.y = Math.PI / 2;
              child.position.set(0, -10, 0);
            }
            if (child.name === "Object_14") {
              // console.log("this is the front paddle");
              // paddle.rotation.y = Math.PI / 2;
              child.position.set(0, -10, 0);
            }
            if (child.name === "Object_16") {
              // console.log("this is the ball");
              // ball.position.set(0, 0, 0);//(z, y, x)
              child.position.set(0, -10, 0);
            }
            if (child.name === "Object_18") {
              // console.log("this is white borders");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_20") {
              // console.log("red words");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_22") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_23") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_24") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_25") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_26") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_28") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_29") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_30") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_32") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_34") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_35") {
              // console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_36") {
              // console.log("left purple");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_37") {
              // console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_38") {
              // console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_39") {
              // console.log("uknown");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_40") {
              // console.log("play back");
              // child.position.set(0, -10, 0);
            }
            if (child.name === "Object_41") {
              // console.log("red button back");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_42") {
              // console.log("cyrcile of the red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_44") {
              // console.log("play front");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_45") {
              // console.log("red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_46") {
              // console.log("cyrcile of the red button front");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_48") {
              child.castShadow = true; //default is false
              child.receiveShadow = true; //default
              // console.log("the big table");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_50") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
            if (child.name === "Object_52") {
              // console.log("uknown");
              // child.position.set(0, 10, 0);
            }
          }
        });
      }
      model.updateMatrixWorld(true);
      tableModel.castShadow = true; //default is false
      tableModel.receiveShadow = true; //default
      // scene.add(gltf.scene);//  ++++++
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
  controls.target.set(0, 80, -38);
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(0, 2000, 300); //change light posistion later
  light.castShadow = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
  scene.add(light);
  //Set up shadow properties for the light
  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 500; // default

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
  // scene.add(floor);

  function containerMouseMove(e) {
    mouseX = e.clientX;
    if (mouseXupdate == null) {
      mouseXupdate = mouseX;
    }
  }
  renderer.domElement.addEventListener("mousemove", containerMouseMove);
  function sendGameStateToBackend2() {
    let data = {
      type: "rendring",
      ball_position: ball.position,
      // Send ball state
      ball_velocity: ball.$velocity,
      paddle1_position: paddle.position,
      // Send paddle state
      paddle1_velocity: paddle.$velocity,
      mouseX: mouseX,
      mouseXupdate: mouseXupdate,
      paddle2_position: paddle2.position,
      // Send paddle2 state
      paddle2_velocity: paddle2.$velocity,
      vitesse: vitesse,
      // Send current speed
      blade_radius: 1,
      ballRadius: 1,
    };
    mouseXupdate = mouseX;
    // console.log("sendGameStateToBackend")

    socket.send(JSON.stringify(data));
  }
  let rotationSpeed = THREE.MathUtils.degToRad(1) / 25;
  function animate() {
    requestAnimationFrame(animate);
    if (rotatingModel) {
      // Rotate the model by 1 degree (converted to radians) each frame
      rotatingModel.rotation.y += rotationSpeed; // 0.5 degree per frame
    }
    controls.update();
    camera.updateProjectionMatrix();
    if (socketIsOpen == true && game_start) {
      sendGameStateToBackend2();
    }
    renderer.render(scene, camera);
  }
  // controls.addEventListener('change', () => { // Only render on change
  //     renderer.render(scene, camera);
  // });
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
    // console.log(controls.target);
    // console.log(camera);
    // console.log('===========================================================');
  });
}
