import * as THREE from 'three';

import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from "GLTFLoader";

import { Sky } from 'Sky';
// from '../../../build/three.module.js';



export function initPingPongGame() {
    console.log('in initGame')
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
        PADDLE_HEIGHT = 30
    // Create a canvas element and add it to the document body
    const canvasDiv = document.getElementById('canvasDiv');
    let canvas = document.createElement('canvas'); // Create a canvas element
    let gameBlock = canvasDiv.appendChild(canvas);
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;
    if (gameBlock == null) console.log('still not created');
    const renderer = new THREE.WebGLRenderer({ canvas: gameBlock });
    renderer.setSize(gameBlock.width, gameBlock.height);
    const camera = new THREE.PerspectiveCamera(45, gameBlock.width / gameBlock.height, 0.1, 1000);
    camera.position.set(0, 200, 400);
    camera.lookAt(0, 120, 0);
    const scene = new THREE.Scene();
    let sky, sun;
    initSky();

    function initSky() {

        sky = new Sky();
        sky.scale.setScalar(450000);
        scene.add(sky);

        sun = new THREE.Vector3();
        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,
            azimuth: 180,
            exposure: renderer.toneMappingExposure
        };
        function guiChanged() {
            const uniforms = sky.material.uniforms;
            uniforms['turbidity'].value = effectController.turbidity;
            uniforms['rayleigh'].value = effectController.rayleigh;
            uniforms['mieCoefficient'].value = effectController.mieCoefficient;
            uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

            const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
            const theta = THREE.MathUtils.degToRad(effectController.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            uniforms['sunPosition'].value.copy(sun);

            renderer.toneMappingExposure = effectController.exposure;
        }
        guiChanged();

    }
    const axesHelper = new THREE.AxesHelper(100);
    // scene.add(axesHelper);

    const lightAmbient = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(lightAmbient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1000, 1000, 1000);
    light.castShadow = true
    scene.add(light);
    const loader = new GLTFLoader();

    loader.load('./assets/ping pong gltf.gltf', function (gltf) {

        // scene.add(gltf.scene);
        const model = gltf.scene;

        // Set the size by scaling the model
        model.scale.set(100, 100, 100); // Adjust the values to resize (x, y, z)

        // Optionally, set the position if needed
        // model.position.set(x, y, z);
        // Traverse the scene to find specific objects (paddles and balls)
        model.traverse(function (child) {
            if (child.isMesh) {
                console.log(child.name)
                // Check the names of the objects (you can inspect the names in a 3D viewer or console)
                if (child.name === 'Ping_Pong_Racket_Ping_Pong_Racket_5828') {
                    // Move the first paddle
                    child.position.set(1, 0, 0); // Adjust the x, y, z values as needed
                } else if (child.name === 'Ping_Pong_Racket_Ping_Pong_Racket_5828001') {
                    // Move the second paddle
                    child.position.set(-1, 0, 0); // Adjust the x, y, z values as needed
                } else if (child.name === '_Revolve_4284') {
                    // Move the first ball
                    child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
                }
                else if (child.name === '_Revolve_4310') {
                    // Move the first ball
                    child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
                }
                else if (child.name === '_Revolve_4298') {
                    // Move the first ball
                    child.position.set(0, 0.5, 0); // Adjust the x, y, z values as needed
                }
                // Similarly, you can find and move Ball2, Ball3, etc.
            }
        });


    }, undefined, function (error) {

        console.error(error);

    });
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Optional, for smooth damping effect
    controls.dampingFactor = 0.25; // Optional, for damping effect
    controls.screenSpacePanning = false; // Whether to enable panning
    controls.target.set(0, 76 + (120 - 76) / 2, 100);

    function checkCollision() {
        let ballRadius = 5
        if (ball.position.y < 76 || ball.position.x < -(274 / 2) || ball.position.x > (274 / 2)) {
            console.log('ball should stop')
            ball.position.x = 0
            ball.position.y = 120
            ball.position.z = 0
            ball.position.set(0, 120, 0)
            console.log(ball.position)
            if (paddle2.$velocity.x !== 0) {
                let timeFrame = Math.abs((ball.position.z - paddle2.position.z) / ball.$velocity.z);
                let ballFutureXpos = ball.position.x + (ball.$velocity.x * timeFrame);
                paddle2.$velocity.x = (ballFutureXpos - paddle2.position.x) / (timeFrame)
            }
        }
        else if (ball.position.z > 0 && ball.position.z < paddle.position.z && ball.position.z + ball.$velocity.z >= paddle.position.z) {
            const ballX = ball.position.x;
            const paddleX = paddle.position.x;
            const distanceX = Math.abs(ballX - paddleX);
            const ballY = ball.position.y;
            const paddleY = paddle.position.y;
            const distanceY = Math.abs(ballY - paddleY);
            if (distanceX < (ballRadius + bladeRadius)) {
                var directio1 = ball.position.x < paddle.position.x ? -1 : 1;
                ball.$velocity.x = directio1 * distanceX * 5 / vitesse
                console.log(distanceX)
                ball.$velocity.y *= -1
                ball.$velocity.z *= -1
                let timeFrame = Math.abs((ball.position.z - paddle2.position.z) / ball.$velocity.z);
                let ballFutureXpos = ball.position.x + (ball.$velocity.x * timeFrame);
                paddle2.$velocity.x = (ballFutureXpos - paddle2.position.x) / (timeFrame)
            }
        }
        else if (ball.position.z < 0 && ball.position.z > paddle2.position.z && ball.position.z + ball.$velocity.z <= paddle2.position.z) {
            const ballX = ball.position.x;
            const paddleX = paddle2.position.x;
            const distanceX = Math.abs(ballX - paddleX);
            const ballY = ball.position.y;
            const paddleY = paddle2.position.y;
            const distanceY = Math.abs(ballY - paddleY);
            if (distanceX < (ballRadius + bladeRadius)) {
                var direction2 = ball.position.x > paddle2.position.x ? -1 : 1;
                ball.$velocity.x = direction2 * distanceX * 5 / vitesse
                console.log(distanceX)
                ball.$velocity.y *= -1
                ball.$velocity.z *= -1
                paddle2.$velocity.x = 0;
            }
        }
    }
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        processBallMovement();
        apdatePaddle2();
        checkCollision();
        renderer.render(scene, camera);
    }
    window.addEventListener('resize', () => {
        canvas.width = canvasDiv.clientWidth;
        canvas.height = canvasDiv.clientHeight;
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
        camera.lookAt(0, 120, 0);
        windowMiddle = window.innerWidth / 2;
    });

    const textureLoader = new THREE.TextureLoader()
    const floorAlphaTexture = textureLoader.load('./assets/floor/031.jpg')
    const floorColorTexture = textureLoader.load('./assets/floor/mossy_cobblestone_diff_1k.jpg')
    const floorARMTexture = textureLoader.load('./assets/floor/mossy_cobblestone_arm_1k.jpg')
    const floorNormalTexture = textureLoader.load('./assets/floor/mossy_cobblestone_nor_gl_1k.jpg')
    const floorDisplacementTexture = textureLoader.load('./assets/floor/mossy_cobblestone_disp_1k.jpg')

    floorColorTexture.wrapS = THREE.RepeatWrapping
    floorARMTexture.wrapS = THREE.RepeatWrapping
    floorNormalTexture.wrapS = THREE.RepeatWrapping
    floorDisplacementTexture.wrapS = THREE.RepeatWrapping

    floorColorTexture.wrapT = THREE.RepeatWrapping
    floorARMTexture.wrapT = THREE.RepeatWrapping
    floorNormalTexture.wrapT = THREE.RepeatWrapping
    floorDisplacementTexture.wrapT = THREE.RepeatWrapping
    floorColorTexture.colorSpace = THREE.SRGBColorSpace
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 1000, 1000),
        new THREE.MeshStandardMaterial({
        })
    )
    floor.position.set(0, 0, 0); // Set plane position
    floor.rotation.x = Math.PI / 2; // Rotate the plane if needed
    const boxGeometry = new THREE.BoxGeometry(152.5, 10, 274);
    const tableColorTexture = textureLoader.load('./assets/table/rosewood_veneer1_diff_1k.jpg')
    const tableARMTexture = textureLoader.load('./assets/table/rosewood_veneer1_arm_1k.jpg')
    const tableNormalTexture = textureLoader.load('./assets/table/rosewood_veneer1_nor_gl_1k.jpg')//
    const tableDisplacementTexture = textureLoader.load('./assets/table/rosewood_veneer1_disp_1k.jpg')

    tableColorTexture.wrapS = THREE.RepeatWrapping
    tableARMTexture.wrapS = THREE.RepeatWrapping
    tableNormalTexture.wrapS = THREE.RepeatWrapping
    tableDisplacementTexture.wrapS = THREE.RepeatWrapping

    tableColorTexture.wrapT = THREE.RepeatWrapping
    tableARMTexture.wrapT = THREE.RepeatWrapping
    tableNormalTexture.wrapT = THREE.RepeatWrapping
    tableDisplacementTexture.wrapT = THREE.RepeatWrapping
    tableColorTexture.colorSpace = THREE.SRGBColorSpace
    const planeMaterial = new THREE.MeshStandardMaterial({

        color: 336699
    });
    const table = new THREE.Mesh(boxGeometry, planeMaterial);
    table.position.set(0, 76, 0); // Set plane position
    scene.add(table);
    const borderThickness = 5; // Thickness of the border
    const borderHeight = 10; // Height of the border
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const border1 = new THREE.Mesh(new THREE.BoxGeometry(152.5 + borderThickness * 2, borderHeight, borderThickness), borderMaterial);
    border1.position.set(0, 76, 274 / 2 + borderThickness / 2);
    const border2 = new THREE.Mesh(new THREE.BoxGeometry(152.5 + borderThickness * 2, borderHeight, borderThickness), borderMaterial);
    border2.position.set(0, 76, -274 / 2 - borderThickness / 2);
    const border3 = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderHeight, 274), borderMaterial);
    border3.position.set(152.5 / 2 + borderThickness / 2, 76, 0);
    const border4 = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderHeight, 274), borderMaterial);
    border4.position.set(-152.5 / 2 - borderThickness / 2, 76, 0);
    const border5 = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderHeight, 274), borderMaterial);
    border5.position.set(0, 76.3, 0);
    const border6 = new THREE.Mesh(new THREE.BoxGeometry(152.5 + borderThickness * 2, borderHeight / 3, borderThickness / 3), borderMaterial);
    border6.position.set(0, 100, 0);
    const geometry = new THREE.CylinderGeometry(1, 1, 100 - 76, 64);
    const cylinder = new THREE.Mesh(geometry, borderMaterial);// scene.add( cylinder );
    cylinder.position.set(152.5 / 2, 100 - (100 - 76) / 2, 0);
    const geometry2 = new THREE.CylinderGeometry(1, 1, 100 - 76, 64);
    const cylinder2 = new THREE.Mesh(geometry2, borderMaterial);// scene.add( cylinder );
    cylinder2.position.set(-152.5 / 2, 100 - (100 - 76) / 2, 0);
    scene.add(border1, border2, border3, border4, border5, border6, cylinder, cylinder2);
    const ballGeometry = new THREE.SphereGeometry(5, 32, 32); // Radius is 2 cm (40 mm / 2)
    const ballMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff // White color as standard for a ping pong ball
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    let vitesse = 35
    ball.position.set(0, 120, 0);
    function startBallMovement() {
        var direction = Math.random() > 0.5 ? -1 : 1;
        ball.$velocity = {
            x: direction * 20 / vitesse,
            z: 100 / vitesse,
            y: -(120 - 98) / vitesse
        };
        ball.$stopped = false;
    }

    function updateBallPosition() {
        var ballPos = ball.position;
        if ((ballPos.x + ball.$velocity.x) > (152.5 / 2) || (ballPos.x + ball.$velocity.x) < -152.5 / 2) {
            ball.$velocity.x *= -1;
            if (paddle2.$velocity.x !== 0)
                paddle2.$velocity.x *= -1;
        }
        ballPos.x += ball.$velocity.x;
        if ((ballPos.y + ball.$velocity.y) > 120) {
            ball.$velocity.y *= -1;
        }
        ballPos.y += ball.$velocity.y;

        ballPos.z += ball.$velocity.z;
    }
    function processBallMovement() {
        if (!ball.$velocity) {
            startBallMovement();
        }
        updateBallPosition();
    }
    scene.add(ball);
    const paddleBladeShape = new THREE.Shape();
    const bladeRadius = 7.5; // Radius for the half-circles
    const bladeWidth = 15; // Width of the blade
    const bladeHeight = 15; // Height of the blade
    paddleBladeShape.moveTo(0, -bladeHeight / 2);
    paddleBladeShape.absarc(0, -bladeHeight / 2 + bladeRadius, bladeRadius, Math.PI, 0, false);
    paddleBladeShape.lineTo(bladeWidth / 2, bladeHeight / 2 - bladeRadius);
    paddleBladeShape.absarc(0, bladeHeight / 2 - bladeRadius, bladeRadius, 0, Math.PI, false);
    paddleBladeShape.lineTo(-bladeWidth / 2, -bladeHeight / 2 + bladeRadius);
    const extrudeSettings = {
        depth: 1, // Blade thickness
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelSegments: 3
    };
    const paddleBladeGeometry = new THREE.ExtrudeGeometry(paddleBladeShape, extrudeSettings);
    const paddleBladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5 // Adjust the opacity value (0.5 means 50% transparent)
    }); const paddleBlade = new THREE.Mesh(paddleBladeGeometry, paddleBladeMaterial);
    const paddleHandleGeometry = new THREE.CylinderGeometry(1.5, 1.5, 10, 32);
    const paddleHandleMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5 // Adjust the opacity value (0.5 means 50% transparent)
    });
    const paddleHandle = new THREE.Mesh(paddleHandleGeometry, paddleHandleMaterial);
    paddleHandle.position.set(bladeRadius, -(bladeHeight / 2 + paddleHandleGeometry.parameters.height / 2) + bladeRadius, 0); // Adjust the position
    paddleHandle.rotation.z = Math.PI / 3;
    const paddle = new THREE.Group();
    paddle.add(paddleBlade);
    paddle.add(paddleHandle);
    paddle.position.set(0, 76 + (120 - 76) / 2, 130);
    scene.add(paddle);
    const paddle2 = paddle.clone();
    paddle2.position.set(0, 76 + (120 - 76) / 2, -130); // Adjust the position as needed
    scene.add(paddle2);
    function apdatePaddle2() {
        if (!paddle2.$velocity) {
            var direction = Math.random() > 0.5 ? -1 : 1;
            paddle2.$velocity = {
                x: 0,
                y: -(120 - 98) / vitesse,
                z: 100 / vitesse
            };
        }
        paddle2.position.x += paddle2.$velocity.x;
    }
    let mouseXupdate;
    let windowMiddle = window.innerWidth / 2;
    function containerMouseMove(e) {
        var mouseX = e.clientX;
        if (!mouseXupdate) {
            mouseXupdate = mouseX;
        }
        {
            if (mouseX > mouseXupdate && (paddle.position.x + 1) < (152.5 / 2)) {
                paddle.position.x += (mouseX - mouseXupdate) / 4;

            }
            else if (mouseX <= mouseXupdate && (paddle.position.x - 1) > (-152.5 / 2)) {
                paddle.position.x -= (mouseXupdate - mouseX) / 4;
            }
            mouseXupdate = mouseX;
        }
        mouseXupdate = mouseX;
    }

    renderer.domElement.addEventListener('mousemove', containerMouseMove);
    renderer.domElement.addEventListener('mousedown', (event) => {
        console.log(controls.target)
        console.log(camera);
        console.log('===========================================================')
    });

    let speedX = 0.1;
    let speedY = 0.1;
    animate();
}