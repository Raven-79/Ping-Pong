import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { myFetch, BACKEND_URL } from "../../../utils/apiRequest.js";
import { Font, FontLoader } from "../../../../node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "../../../../node_modules/three/examples/jsm/loaders/TTFLoader.js";
import { TextGeometry } from "../../../../node_modules/three/examples/jsm/geometries/TextGeometry.js";
// from '../../../build/three.module.js';
// import { OrbitControls } from '../../../examples/jsm/controls/OrbitControls.js';

export class localGame {
    constructor(canvasParent, gameDisplayer) {
        console.log("localGame");
        this.canvasParent = canvasParent;
        this.gameDisplayer = gameDisplayer;
        gameDisplayer.game = this;
        this.isRunning = true;
        this.isGameOver = false;
        this.GAME_SPEED = 0.2;
        this.WIDTH = 1600;
        this.HEIGHT = 900;
        this.PADDLE_WIDTH = 3
        this.PADDLE_HEIGHT = 1
        this.BALL_RADIUS = 1
        this.FPS = 60
        this.MAX_POINTS = 5
        this.winner = null
        this.sound = null
        this.playersInfo = {
            playerFront: "player 2",
            playerBack: "player 1",
            playerFrontScore: 0,
            playerBackScore: 0,
            playerFrontAvatar: "profile_pictures/2_hGDPPbZ.png",
            playerBackAvatar: "profile_pictures/2_hGDPPbZ.png",
        };
        this.intervals = [];
        this.timeouts = [];
        this.init();
    }
    async init() {
        console.log("init");
        await this.createScene();
        this.CountDown3Dobjects();
        this.monitorGameOver();
        this.initGame();
        this.checkAndDisplayObjects();
        this.game_loop();
    }
    monitorGameOver() {
        const checkGameOver = setInterval(() => {
            if (this.isGameOver) {
                this.playersInfo.playerFrontScore = this.scores.playerFront;
                this.playersInfo.playerBackScore = this.scores.playerBack;
                clearInterval(checkGameOver); // Stop the interval once `gameOver()` is called
                this.gameOver(this.scores.playerFront === this.MAX_POINTS ? "playerFront" : "playerBack");
            }
        }, 100); // Check every 100ms
        this.checkGameOver = checkGameOver;
    }
    initGame() {
        this.paddles = {
            front: {
                x: 0,
                z: 25,
                dx: 0,
                dz: 0

            },
            back: {
                x: 0,
                z: -25,
                dx: 0,
                dz: 0

            }
        };

        this.scores = {
            playerFront: 0,
            playerBack: 0
        };

        this.ball = {
            x: 0,
            z: 0,
            speedX: 0.2,
            speedZ: 0.2
        };
        // // Create a plane geometry
        // const planeGeometry = new THREE.PlaneGeometry(100, 100);
        // const planeMaterial = new THREE.MeshStandardMaterial({
        //     color: 0x808080, // Gray color
        //     side: THREE.DoubleSide, // Render both sides of the plane
        // });
        // const floor = new THREE.Mesh(planeGeometry, planeMaterial);

        // // Set the position and rotation of the floor
        // floor.position.set(0, 0, 0); // Centered at the origin
        // floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal

        // // Add the floor to the scene
        // this.addMesh(floor);

        this.lightning();
        this.create3Dobjects();
        this.addSoundEffects();

        window.addEventListener("keydown", (event) => {
            this.keydownHandler(event);
        });
        window.addEventListener("keyup", (event) => {
            this.keyupHandler(event);
        });
        window.addEventListener("resize", () => this.resizeHandler());

        // window.addEventListener("resize", this.resizeHandler.bind(this));

        // const tableGeometry = new THREE.BoxGeometry(40, 1.5, 60); // A cube (1x1x1)
        // const tableMaterial = new THREE.MeshStandardMaterial({
        //   color: 0x14181c,
        //   metalness: 0.6,  // High metalness for reflective effect
        //   roughness: 0.2,  // Low roughness for a shiny surface
        // }); // Yellow color
        // this.tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
        // this.tableMesh.position.set(this.ball.x, 63, this.ball.z);
        // this.addMesh(this.tableMesh);
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.target.set(0, 65, 0);
    }
    gameStartFunc() {
        if (this.isGameOver == true)
            return;
        this.removeMesh(this.number3Mesh);
        this.removeMesh(this.startMesh);
        this.removeMesh(this.number0Mesh);
        this.addMesh(this.score1Mesh);
        this.addMesh(this.score2Mesh);
        this.addMesh(this.frontPaddle);
        this.addMesh(this.backPaddle);
        this.addMesh(this.ballMesh);
        this.addMesh(this.frontWall);
        this.addMesh(this.backWall);
        this.addMesh(this.rightWall);
        this.addMesh(this.leftWall);
        this.addMesh(this.tableModel);
        this.addMesh(this.profileBackMesh);
        this.addMesh(this.profileFrontMesh);

        const requiredObjects = [
            this.score1Mesh,
            this.score2Mesh,
            this.frontPaddle,
            this.backPaddle,
            this.ballMesh,
            this.frontWall,
            this.backWall,
            this.rightWall,
            this.leftWall,
            this.tableModel,
        ];

        const interval2 = setInterval(() => {
            clearInterval(interval2);
            if (this.isGameOver == true)
                return;
            // Check if all required objects are in the scene
            const allAdded = requiredObjects.every((obj) => this.scene.children.includes(obj));

            if (allAdded) {
                this.resizeHandler();
                // this.camera.rotation.z = -Math.PI / 2;
                this.gameStart = true;
                this.light.position.set(0, 2000, 300);
            }
        }, 100); // Check every 100ms
    }

    loadingFonts(data) {
        this.textFont = null
        const loader = new TTFLoader();
        loader.load("./assets/source/kenpixel.ttf", (json) => {
            const font = new Font(json);
            this.textFont = font;
            this.adding3dText();
        });
        this.ScoreFont = null;
        const textloader = new FontLoader();
        textloader.load("./assets/source/modes/Pong_Score_Regular.json", (loadedFont) => {
            const font = new Font(loadedFont);
            this.ScoreFont = font;
        });
    }

    adding3dText() {
        const startText = "GAME WILL START IN";
        const startGeometry = new TextGeometry(startText, {
            font: this.textFont,
            size: 1.8,
            depth: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3,
        });
        const startMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x3ECDDB,    // Light-emitting color
            emissiveIntensity: 0.5,  // Intensity of the light emission
        });
        const startMesh = new THREE.Mesh(startGeometry, startMaterial);

        // Center the text
        startGeometry.computeBoundingBox();
        const startBoundingBox = startGeometry.boundingBox;
        const startWidth = startBoundingBox.max.x - startBoundingBox.min.x;
        startMesh.position.set(7, 90, -startWidth / 2);
        this.startMesh = startMesh;
        this.startMesh.rotation.x = -Math.PI / 2; 
        this.startMesh.rotation.z = -Math.PI / 2;

        this.number0Mesh = this.get3dNumber("0");
        // this.number0Mesh.rotation.x = -Math.PI / 2;
        this.number1Mesh = this.get3dNumber("1");
        // this.number1Mesh.rotation.x = -Math.PI / 2;
        this.number2Mesh = this.get3dNumber("2");
        // this.number2Mesh.rotation.x = -Math.PI / 2;
        this.number3Mesh = this.get3dNumber("3");
        // this.number3Mesh.rotation.x = -Math.PI / 2;
        this.profileBackMesh = this.addPlayerName(this.playerFront || "Player 1", -10);
        this.profileBackMesh.rotation.x = -Math.PI / 2;
        this.profileBackMesh.rotation.z = -Math.PI / 2;
        this.profileFrontMesh = this.addPlayerName(this.playerBack || "Player 2", 10);
        this.profileFrontMesh.rotation.x = -Math.PI / 2;
        this.profileFrontMesh.rotation.z = -Math.PI / 2;
    }

    get3dNumber(numberText) {
        const numberGeometry = new TextGeometry(numberText, {
            font: this.textFont,
            size: 2.8,
            depth: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3,
        });

        const numberMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffd700,    // Light-emitting color
            emissiveIntensity: 0.7,  // Intensity of the light emission

        });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);

        // Center the number text
        numberGeometry.computeBoundingBox();
        const numberBoundingBox = numberGeometry.boundingBox;
        const numberWidth = numberBoundingBox.max.x - numberBoundingBox.min.x;
        numberMesh.position.set(0, 90, -numberWidth / 2);
        numberMesh.rotation.x = -Math.PI / 2;
        numberMesh.rotation.z = -Math.PI / 2;
        return numberMesh;
    }
    startCountDown(data) {

        // Load profile image texture
        const textureLoader = new THREE.TextureLoader();
        const profileImage = textureLoader.load(`${BACKEND_URL}/auth/media/${data.profileFront.avatar}`);

        // Create plane for profile picture (center of the frame)
        const pictureGeometry = new THREE.CircleGeometry(4, 32);  // Size of the profile picture
        const pictureMaterial = new THREE.MeshBasicMaterial({ map: profileImage });
        const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);

        // Create frame around the profile picture
        const frameGeometry = new THREE.TorusGeometry(4.5, 0.5, 16, 100);  // Slightly larger than the profile picture
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3ECDDB,
            // metalness: 0.6,  // High metalness for reflective effect
            // roughness: 0.2,  // Low roughness for a shiny surface
            emissive: 0x3ECDDB,    // Light-emitting color
            emissiveIntensity: 0.4,  // Intensity of the light emission
        }); // Brown color for the frame
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        frameMesh.position.set(10, 90, 0);
        pictureMesh.position.set(10, 90, 0);

        const frameMesh2 = frameMesh.clone();
        const profileImage2 = textureLoader.load(`${BACKEND_URL}/auth/media/${data.profileBack.avatar}`);
        const pictureMaterial2 = new THREE.MeshBasicMaterial({ map: profileImage2 });
        const pictureMesh2 = new THREE.Mesh(pictureGeometry, pictureMaterial2);
        frameMesh2.position.set(-10, 90, 0);
        pictureMesh2.position.set(-10, 90, 0);

        // Add frame and profile picture to the scene
        this.addMesh(frameMesh);
        this.addMesh(pictureMesh);
        this.addMesh(frameMesh2);
        this.addMesh(pictureMesh2);
    }
    addPlayerName = (name, xPosition) => {
        const nameGeometry = new TextGeometry(name, {
            font: this.textFont,
            size: 1.8,
            depth: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3,
        });

        const nameMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            emissive: 0x3ECDDB,    // Light-emitting color
            emissiveIntensity: 0.2,
            transparent: true,      // Enable transparency
            opacity: 0.5,  // Intensity of the light emission
        });

        const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
        nameGeometry.computeBoundingBox();
        const nameWidth = nameGeometry.boundingBox.max.x - nameGeometry.boundingBox.min.x;

        // Position the name below the frame
        if (xPosition < 0) {
            nameMesh.position.set(0, 65, nameWidth * -1 - nameWidth/2);
        }
        else {
            nameMesh.position.set(0, 65, nameWidth / 2);
        }
        return nameMesh;
    };
    // Function to format the score as a two-digit string
    formatScore(score) {
        return score < 10 ? "0" + score : score.toString();
    }

    createScoreText(score) {
        const formattedScore = this.formatScore(score); // Format the score
        const textGeometry = new TextGeometry(formattedScore, {
            font: this.ScoreFont,
            size: 2.1,
            depth: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff
        });
        return new THREE.Mesh(textGeometry, textMaterial);
    }

    updateSound(sound) {
        if (sound == "goal")
            this.goalSound.play();
        if (sound == "paddle")
            this.paddleHitSound.play();
        if (sound == "wall")
            this.wallHitSound.play();
    }

    updateScore(score) {
        if (score == "front") {

            this.removeMesh(this.score1Mesh); // Remove old score mesh
            this.score1Mesh = this.createScoreText(this.scores.playerFront);
            this.score1Mesh.rotation.z = -Math.PI / 2;
            this.score1Mesh.rotation.x = -Math.PI / 2;
            this.score1Mesh.position.set(13.2, 65, 4);
            this.addMesh(this.score1Mesh);
        } else if (score == "back") {
            this.removeMesh(this.score2Mesh); // Remove old score mesh
            this.score2Mesh = this.createScoreText(this.scores.playerBack);
            this.score2Mesh.rotation.z = -Math.PI / 2;
            this.score2Mesh.rotation.x = -Math.PI / 2;
            this.score2Mesh.position.set(13.2, 65, -7.4);
            this.addMesh(this.score2Mesh);
        }
    }
    // loadingProfiles() {

    //     const textureLoader = new THREE.TextureLoader();

    //     // Helper function to load and optimize textures
    //     const loadOptimizedTexture = (url) => {
    //         const texture = textureLoader.load(url);
    //         texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy(); // Max anisotropy for better quality
    //         texture.encoding = THREE.sRGBEncoding; // Use sRGB encoding for accurate colors
    //         texture.minFilter = THREE.LinearMipMapLinearFilter; // Smooth transitions between mipmaps
    //         texture.magFilter = THREE.LinearFilter; // High-quality magnification filter
    //         return texture;
    //     };

    //     // Load and optimize textures
    //     const profileImage = loadOptimizedTexture(`${BACKEND_URL}/auth/media/${this.playersInfo.playerFrontAvatar}`);
    //     const profileImage2 = loadOptimizedTexture(`${BACKEND_URL}/auth/media/${this.playersInfo.playerBackAvatar}`);

    //     // Create geometry and materials
    //     const pictureGeometry = new THREE.CircleGeometry(4, 64); // Increase segments for smoother edges
    //     const pictureMaterial = new THREE.MeshBasicMaterial({ map: profileImage });
    //     const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);

    //     const frameGeometry = new THREE.TorusGeometry(4.5, 0.5, 32, 128); // Increase segments for smoother frame
    //     const frameMaterial = new THREE.MeshStandardMaterial({
    //         color: 0x3ECDDB,
    //         emissive: 0x3ECDDB,
    //         emissiveIntensity: 0.4,
    //     });
    //     const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

    //     frameMesh.position.set(10, 90, this.camera.position.z - 5);
    //     frameMesh.rotation.x = -Math.PI / 2;    
    //     pictureMesh.position.set(10, 90, this.camera.position.z - 5);
    //     pictureMesh.rotation.x = -Math.PI / 2;

    //     const frameMesh2 = frameMesh.clone();
    //     const pictureMaterial2 = new THREE.MeshBasicMaterial({ map: profileImage2 });
    //     const pictureMesh2 = new THREE.Mesh(pictureGeometry, pictureMaterial2);
    //     frameMesh2.position.set(-10, 90, this.camera.position.z - 5);
    //     frameMesh2.rotation.x = -Math.PI / 2;
    //     pictureMesh2.position.set(-10, 90, this.camera.position.z - 5);
    //     pictureMesh2.rotation.x = -Math.PI / 2;

    //     // Add frame and profile picture to the scene
    //     this.frameMesh = frameMesh;
    //     this.pictureMesh = pictureMesh;
    //     this.frameMesh2 = frameMesh2;
    //     this.pictureMesh2 = pictureMesh2;
    // }


    CountDown3Dobjects() {
        this.loadingFonts();
        // this.loadingProfiles();
    }
    async createScene() {
        this.gameBlock = document.createElement("canvas");
        this.gameBlock = this.canvasParent.appendChild(this.gameBlock);
        this.gameBlock.width = this.gameBlock.parentElement.clientWidth;
        this.gameBlock.height = this.gameBlock.parentElement.clientHeight;

        const renderer = new THREE.WebGLRenderer({
            canvas: this.gameBlock
        });
        this.renderer = renderer;
        this.renderer.setSize(this.gameBlock.width, this.gameBlock.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        const scene = new THREE.Scene();
        this.scene = scene;
        this.addCamera();
        this.lightning();
        this.addBackGround();
    }

    addCamera() {
        const camera = new THREE.PerspectiveCamera(75, this.gameBlock.width / this.gameBlock.height, 0.1, 1000);
        this.camera = camera;
        this.resizeHandler();
    }
    lightning() {
        const light = new THREE.DirectionalLight(0xffffff, 0.5);
        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);

        light.castShadow = true;
        light2.castShadow = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
        this.light = light;
        this.light2 = light2;
        this.addMesh(light);
        this.addMesh(light2);
        this.light.position.set(0, this.camera.position.y, 300);
        this.light2.position.set(0, this.camera.position.y, -300);
        const lightAmbient = new THREE.AmbientLight(0x404040); // soft white light
        this.addMesh(lightAmbient);
    }
    addBackGround() {
        const SphereGeometry = new THREE.SphereGeometry(500, 1, 1);
        const SphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x254a59, // 0x0a1926,
            side: THREE.BackSide
        });
        this.sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
        this.sphere.position.set(0, 0, 0);
        this.addMesh(this.sphere);
    }

    create3Dobjects() {
        const textloader = new FontLoader();
        textloader.load("./assets/source/modes/Pong_Score_Regular.json", (loadedFont) => {
            this.ScoreFont = loadedFont;
            const textGeometry = new TextGeometry("00", {
                font: loadedFont,
                size: 2.1,
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.05,
                bevelOffset: 0,
                bevelSegments: 5
            });

            this.textGeometry = textGeometry;
            const textMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.2,
            });
            this.textMaterial = textMaterial;

            this.score1Mesh = new THREE.Mesh(this.textGeometry, this.textMaterial);
            this.score1Mesh.position.set(13.5, 65, 2.5);
            this.score1Mesh.scale.set(1.5, 1, 1);
            this.score1Mesh.rotation.z = -Math.PI / 2;
            this.score1Mesh.rotation.x = -Math.PI / 2;

            this.score2Mesh = new THREE.Mesh(this.textGeometry, this.textMaterial);
            this.score2Mesh.position.set(13.5, 65, -8.9);
            this.score2Mesh.scale.set(1.5, 1, 1);
            this.score2Mesh.rotation.z = -Math.PI / 2;
            this.score2Mesh.rotation.x = -Math.PI / 2;
        });
        const ballGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const ballMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
        });
        this.ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ballMesh.position.set(this.ball.x, 65, this.ball.z);

        const paddleGeometry = new THREE.BoxGeometry(6, 1.5, 1);
        const paddleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
        });

        // Left paddle
        this.backPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        // Position it on the left side
        this.backPaddle.position.set(this.paddles.back.x, 65, -25);

        // Right paddle
        this.frontPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        // Position it on the right side
        this.frontPaddle.position.set(this.paddles.front.x, 65, 25)
        const WallGeometry = new THREE.BoxGeometry(37, 1, 1);
        const WallMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.2,
        });

        this.backWall = new THREE.Mesh(WallGeometry, WallMaterial);
        this.backWall.position.set(0, 64.9, -27);
        this.frontWall = new THREE.Mesh(WallGeometry, WallMaterial);
        this.frontWall.position.set(0, 64.9, 27)

        const sideWallGeometry = new THREE.BoxGeometry(1, 1, 55);
        this.leftWall = new THREE.Mesh(sideWallGeometry, WallMaterial);
        this.leftWall.position.set(-18, 64.9, 0);
        this.rightWall = new THREE.Mesh(sideWallGeometry, WallMaterial);
        this.rightWall.position.set(18, 64.9, 0)

        const loader = new GLTFLoader();
        loader.load(
            "./assets/source/day_6_video_game/scene.gltf",
            (gltf) => {
                const model = gltf.scene;
                // Set the size by scaling the model
                model.scale.set(3, 3, 3);

                model.rotation.y = -Math.PI / 2;
                model.position.set(0, 65, 0);
                // Traverse the scene to find specific objects (paddles and balls)
                model.castShadow = true; //default is false
                model.receiveShadow = true; //default
                if (model) {
                    model.traverse((child) => {
                        if (child.isMesh) {
                            if (child.name === "Object_4") {
                                // console.log("score back");
                                child.position.set(0, -1, 0);
                            }
                            if (child.name === "Object_6") {
                                // console.log("score front");
                                child.position.set(0, -1, 0);
                            }
                            if (child.name === "Object_18") {
                                // console.log("this is white borders");
                                child.position.set(0, -10, 0);
                            }
                            if (child.name === "Object_10") {
                                // console.log("limits between players");
                                child.position.set(0, -1, 0);
                            }
                            if (child.name === "Object_12") {
                                // console.log("this is the back paddle");
                                child.position.set(0, -10, 0);
                            }
                            if (child.name === "Object_14") {
                                // console.log("this is the front paddle");
                                child.position.set(0, -10, 0);
                            }
                            if (child.name === "Object_16") {
                                // console.log("this is the ball");
                                child.position.set(0, -10, 0);
                            }
                        }
                    });
                }
                model.updateMatrixWorld(true);
                model.castShadow = true; //default is false
                model.receiveShadow = true; //default
                // this.addMesh(gltf.scene);//  ++++++
                this.tableModel = gltf.scene;
                // this.addMesh(this.tableModel);
            },
            undefined,
            function (error) {
                console.error(error);
            }
        );
    }

    addSoundEffects() {
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.audioLoader = new THREE.AudioLoader();
        this.paddleHitSound = new THREE.Audio(this.listener);
        this.goalSound = new THREE.Audio(this.listener);
        this.wallHitSound = new THREE.Audio(this.listener);
        this.countDownSound = new THREE.Audio(this.listener);

        this.audioLoader.load(
            './assets/source/paddle_hit.mp3',
            (buffer) => {
                this.paddleHitSound.setBuffer(buffer);
                this.paddleHitSound.setLoop(false);
                this.paddleHitSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error('Error loading sound:', error);
            }
        );

        this.audioLoader.load(
            './assets/source/goal.mp3',
            (buffer) => {
                this.goalSound.setBuffer(buffer);
                this.goalSound.setLoop(false);
                this.goalSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error('Error loading sound:', error);
            }
        );

        this.audioLoader.load(
            './assets/source/wall_hit.mp3',
            (buffer) => {
                this.wallHitSound.setBuffer(buffer);
                this.wallHitSound.setLoop(false);
                this.wallHitSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error('Error loading sound:', error);
            }
        );

        this.audioLoader.load(
            './assets/source/game-countdown.mp3',
            (buffer) => {
                this.countDownSound.setBuffer(buffer);
                this.countDownSound.setLoop(false);
                this.countDownSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error('Error loading sound:', error);
            }
        );
    }

    removeSoundEffects() {
        if (this.paddleHitSound) {
            this.paddleHitSound.stop();
            this.paddleHitSound = null;
        }
        if (this.goalSound) {
            this.goalSound.stop();
            this.goalSound = null;
        }
        if (this.wallHitSound) {

            this.wallHitSound.stop();
            this.wallHitSound = null;
        }
        if (this.countDownSound) {
            this.countDownSound.stop();
            this.countDownSound = null;
        }
    }

    remove3DObjects() {

        if (this.number3Mesh)
            this.removeMesh(this.number3Mesh);
        if (this.startMesh)
            this.removeMesh(this.startMesh);
        if (this.number0Mesh)
            this.removeMesh(this.number0Mesh);
        if (this.number1Mesh)
            this.removeMesh(this.number1Mesh);
        if (this.number2Mesh)
            this.removeMesh(this.number2Mesh);


        if (this.score1Mesh) {
          this.removeMesh(this.score1Mesh);
          this.score1Mesh = null;
        }
        if (this.score2Mesh) {
          this.removeMesh(this.score2Mesh);
          this.score2Mesh = null;
        }
        if (this.ballMesh) {
          this.removeMesh(this.ballMesh);
          this.ballMesh = null;
        }
        if (this.backPaddle) {
          this.removeMesh(this.backPaddle);
          this.backPaddle = null;
        }
        if (this.frontPaddle) {
          this.removeMesh(this.frontPaddle);
          this.frontPaddle = null;
        }
        if (this.backWall) {
          this.removeMesh(this.backWall);
          this.backWall = null;
        }
        if (this.frontWall) {
          this.removeMesh(this.frontWall);
          this.frontWall = null;
        }
        if (this.leftWall) {
          this.removeMesh(this.leftWall);
          this.leftWall = null;
        }
        if (this.rightWall) {
          this.removeMesh(this.rightWall);
          this.rightWall = null;
        }
        if (this.tableModel) {
          this.removeMesh(this.tableModel);
          this.tableModel = null;
        }
        if (this.profileBackMesh) {
          this.removeMesh(this.profileBackMesh);
          this.profileBackMesh = null;
        }
        if (this.profileFrontMesh) {
          this.removeMesh(this.profileFrontMesh);
          this.profileFrontMesh = null;
        }
    }

    gameOver(winner) {
        // Stop all sounds
        this.stopAllSounds();

        // Remove all 3D objects from the scene
        this.clearScene();

        // Transition to the game over state
        this.playingGameOver();

        // Play game over sound
        this.playGameOverSounds(winner);
    }
    stopAllSounds() {
        // if (this.waitingSound) this.stopWaitingSound();
        if (this.goalSound) this.goalSound.stop();
        if (this.paddleHitSound) this.paddleHitSound.stop();
        if (this.wallHitSound) this.wallHitSound.stop();
        if (this.countDownSound) {
            this.countDownSound.pause();
            this.countDownSound.currentTime = 0;
            this.countDownSound.stop();
        }
    }

    clearScene() {
        this.remove3DObjects();
        this.removeSoundEffects();
    }

    playGameOverSounds(winner) {
        this.gameOverSound = new Audio('./assets/source/game-over-sound.mp3');
        this.gameOverSound.loop = false;
        this.gameOverSound.volume = 0.5;

        this.gameOverSound.play().catch((error) => {
            console.error('Error playing gameOver sound:', error);
        });

        this.gameOverSound2 = new Audio('./assets/source/game-over.mp3');
        this.gameOverSound2.loop = false;
        this.gameOverSound2.volume = 0.5;

        this.gameOverSound.addEventListener('ended', () => {
            this.gameOverSound2.play().catch((error) => {
                console.error('Error playing gameOver2 sound:', error);
            });
            this.gameOverSound2.addEventListener('ended', () => {
                this.closeGame(winner);
            });
        });
    }

    closeGame(winner) {
        this.canvasParent.removeChild(this.gameBlock);
        this.gameDisplayer.$updateState({
            gameOver: true,
            playersInfo: this.playersInfo
        });
    }
    resizeHandler() {
        this.camera.aspect = this.canvasParent.clientWidth / this.canvasParent.clientHeight;
        this.renderer.setSize(this.canvasParent.clientWidth, this.canvasParent.clientHeight);
        if (this.canvasParent.clientWidth <= 428) {
            this.camera.position.set(0, 120 + 120 * (30 / this.canvasParent.clientWidth), 0);
        }
        else
            this.camera.position.set(0, 120, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
        this.camera.rotation.z = -Math.PI / 2;

        // this.camera.aspect = this.canvasParent.clientWidth / this.canvasParent.clientHeight;
        // console.log(this.canvasParent.clientWidth);
        // console.log("resizeHandler");
        // this.renderer.setSize(this.gameBlock.width, this.gameBlock.height);
        // if (this.canvasParent.clientWidth <= 428) {
        //     this.camera.position.set(0, 195 + 195 * (30 / this.canvasParent.clientWidth), 0);
        // }
        // else
        //     this.camera.position.set(0, 195, 0);
        // this.camera.updateProjectionMatrix();
    }

    resizeHandler3() {
        this.camera.aspect = this.canvasParent.clientWidth / this.canvasParent.clientHeight;
        this.renderer.setSize(this.canvasParent.clientWidth, this.canvasParent.clientHeight);
        if (this.canvasParent.clientWidth <= 428) {
            this.camera.position.set(0, 120 + 120 * (30 / this.canvasParent.clientWidth), 0);
        }
        else
            this.camera.position.set(0, 120, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
    }

    // resizeHandler2() {
    //     this.camera.lookAt(0, 65, 0);
    //     this.camera.aspect = this.canvasParent.clientWidth / this.canvasParent.clientHeight;
    //     this.renderer.setSize(this.canvasParent.clientWidth, this.canvasParent.clientHeight);
    //     if (this.canvasParent.clientWidth <= 428) {
    //         this.camera.position.set(0, 95 + 95 * (30 / this.canvasParent.clientWidth), 46 + 46 * (30 / this.canvasParent.clientWidth));
    //     }
    //     else
    //         this.camera.position.set(0, 95, 46);
    //     this.camera.updateProjectionMatrix();
    // }

    playingGameOver() {
        this.resizeHandler();
        // this.light.position.set(0, this.camera.position.y, this.camera.position.z + 5);
        this.textFont = null;
        let winnerText = null;
        const loader = new TTFLoader();

        winnerText = this.winner;

        loader.load("./assets/source/kenpixel.ttf", (json) => {
            const font = new Font(json);
            this.textFont = font;

            const GameOverText = "GAME OVER";
            const GameOverGeometry = new TextGeometry(GameOverText, {
                font: this.textFont,
                size: 2.5,
                depth: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 3,
            });

            const GameOverMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const GameOverMesh = new THREE.Mesh(GameOverGeometry, GameOverMaterial);
            // Center the GameOver text
            GameOverGeometry.computeBoundingBox();
            const GameOverBoundingBox = GameOverGeometry.boundingBox;
            const GameOverWidth = GameOverBoundingBox.max.x - GameOverBoundingBox.min.x;
            GameOverMesh.position.set(0, 90, -GameOverWidth / 2);
            
            GameOverMesh.rotation.x = -Math.PI / 2;
            GameOverMesh.rotation.z = -Math.PI / 2;

            this.addMesh(GameOverMesh);
            // this.camera.lookAt(0, this.camera.position.y, 0);
        });
    }

    updatePositions() {
        this.ballMesh.position.set(this.ball.x, 65, this.ball.z);
        this.backPaddle.position.set(this.paddles.back.x, 65, -25);
        this.frontPaddle.position.set(this.paddles.front.x, 65, 25);
    }

    game_loop() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.game_loop());
        if (this.gameStart && this.isGameOver == false) {
            this.updatePaddeles();
            this.updateBall();
            this.updatePositions();
            if (this.scores.playerFront == this.MAX_POINTS || this.scores.playerBack == this.MAX_POINTS) {
                this.isGameOver = true;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updatePaddeles() {
        this.ball.x += this.ball.speedX
        this.ball.z += this.ball.speedZ

        if (
            this.ball.x + this.ball.speedX <= -16.6
            || this.ball.x + this.ball.speedX >= 16.6
        ) {
            this.ball.speedX *= -1
            this.sound = "wall"
            this.updateSound("wall");
            this.updateSpeed(0.02)
        }
        else
            this.sound = ""

        if (this.ball.z <= -26) {
            this.scores.playerFront += 1
            this.updateScore("front");
            this.reset_ball()
            this.updateSound("goal");
            this.sound = "goal"
        }
        else if (this.ball.z >= 26) {
            this.scores.playerBack += 1
            this.updateScore("back");
            this.reset_ball()
            this.updateSound("goal");
            this.sound = "goal"
        }
        else if (
            this.ball.z > 0
            && this.ball.z < this.paddles.front.z
            && Math.abs(this.ball.z - this.paddles.front.z) < 1.25
            && Math.abs(this.ball.x - this.paddles.front.x) < 3.75
        ) {
            this.ball.z -= 1.26 - Math.abs(this.ball.z - this.paddles.front.z)
            this.ball.speedZ *= -1
            let distanceX = Math.abs(this.paddles.front.x - this.ball.x)
            let dx_sign = 0
            if (this.ball.x > this.paddles.front.x)
                dx_sign = 1
            else dx_sign = -1
            if (distanceX <= (3))
                this.ball.speedX = distanceX * 0.5 * this.GAME_SPEED * dx_sign
            if (
                this.ball.x + this.ball.speedX <= -16.6
                || this.ball.x + this.ball.speedX >= 16.6
            )
                this.ball.speedX *= -1
            this.updateSpeed(0.05)
            this.sound = "paddle"
            this.updateSound("paddle");
        }


        else if (
            this.ball.z < 0
            && this.ball.z > this.paddles.back.z
            && Math.abs(this.ball.z - this.paddles.back.z) < 1.25
            && Math.abs(this.ball.x - this.paddles.back.x) < 3.75
        ) {
            this.ball.z += 1.26 - Math.abs(this.ball.z - this.paddles.back.z)
            this.ball.speedZ *= -1
            let distanceX = Math.abs(this.paddles.back.x - this.ball.x)
            let dx_sign = 0
            if (this.ball.x < this.paddles.back.x)
                dx_sign = -1
            else dx_sign = 1
            if (distanceX <= (3))
                this.ball.speedX = distanceX * 0.5 * this.GAME_SPEED * dx_sign
            if (
                this.ball.x + this.ball.speedX <= -16.6
                || this.ball.x + this.ball.speedX >= 16.6
            )
                this.ball.speedX *= -1
            this.updateSpeed(0.05)
            this.sound = "paddle"
            this.updateSound("paddle");
        }
        else if (this.sound != "wall")
            this.sound = ""
    }

    keyupHandler(event) {
        const key = event.key;
        if (key == "ArrowUp")
            this.paddles.front.dx = 0;
        else if (key == "ArrowDown")
            this.paddles.front.dx = 0;
        else if (key == "W" || key == "w")
            this.paddles.back.dx = 0;
        else if (key == "S" || key == "s")
            this.paddles.back.dx = 0;
    }

    keydownHandler(event) {
        const key = event.key;
        let paddleSpeed = 1.5 * this.GAME_SPEED
        if (key == "ArrowUp")
            this.paddles.front.dx = paddleSpeed * 1;
        else if (key == "ArrowDown")
            this.paddles.front.dx = paddleSpeed * -1;
        else if (key == "W" || key == "w")
            this.paddles.back.dx = paddleSpeed * 1;
        else if (key == "S" || key == "s")
            this.paddles.back.dx = paddleSpeed * -1;
    }

    updateBall() {
        if (
            (this.paddles.back.dx != 0)
            && (-17 + this.PADDLE_WIDTH)
            <= (this.paddles.back.x + this.paddles.back.dx)
            && (this.paddles.back.x + this.paddles.back.dx)
            <= (17 - this.PADDLE_WIDTH)
        )
            this.paddles.back.x += this.paddles.back.dx;
        // else if (this.paddles.back.dx < 0)
        //     this.paddles.back.x = -17 + this.PADDLE_WIDTH;
        // else if (this.paddles.back.dx > 0)
        //     this.paddles.back.x = 17 - this.PADDLE_WIDTH;

        if (
            (this.paddles.front.dx != 0)
            && (-17 + this.PADDLE_WIDTH)
            <= (this.paddles.front.x + this.paddles.front.dx)
            && (this.paddles.front.x + this.paddles.front.dx)
            <= (17 - this.PADDLE_WIDTH)
        )
            this.paddles.front.x += this.paddles.front.dx;
        // else if (this.paddles.front.dx < 0)
        //     this.paddles.front.x = -17 + this.PADDLE_WIDTH;
        // else if (this.paddles.front.dx > 0)
        //     this.paddles.front.x = 17 - this.PADDLE_WIDTH;

    }

    updateSpeed(SPEED_INCREMENT) {
        let MAX_GAME_SPEED = 1.4
        if (this.GAME_SPEED < MAX_GAME_SPEED)
            this.GAME_SPEED += SPEED_INCREMENT
        this.GAME_SPEED = Math.min(
            this.GAME_SPEED, MAX_GAME_SPEED
        )
    }

    reset_ball() {
        this.GAME_SPEED = 0.2
        this.ball.x = 0
        this.ball.z = 0
        const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
        this.ball.speedX = randomDirectionX * this.GAME_SPEED;
        let dz_sign = 0
        if (this.ball.speedZ > 0)
            dz_sign = 1
        else
            dz_sign = -1
        this.ball.speedZ = dz_sign * this.GAME_SPEED
    }

    destroy() {
        this.isGameOver = true;
        this.clearAllTimers();
        this.isRunning = false;
        if (this.socket) {
            this.socket.close();
            this.socket.onmessage = null;
            this.socket.onopen = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
        }

        window.removeEventListener("keydown", this.keydownHandler);
        window.removeEventListener("keyup", this.keyupHandler);
        window.removeEventListener("resize", this.resizeHandler);

        // Dispose of Three.js resources
        const disposeObject = (obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((mat) => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (obj.texture) obj.texture.dispose();
        };

        // Traverse && dispose objects in the scene
        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.isMesh) {
                    disposeObject(child);
                }
            });
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
        }

        // Stop and dispose of audio
        this.stopAllSounds();
        // if (this.waitingSound) this.stopWaitingSound();

        // Remove canvas
        if (this.gameBlock && this.canvasParent.contains(this.gameBlock)) {
            this.canvasParent.removeChild(this.gameBlock);
        }

        // Nullify references for garbage collection
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.socket = null;
        this.gameBlock = null;
        return true;

    }
    removeMesh(mesh) {
        if (this.scene && mesh && this.scene.children.includes(mesh)) {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => mat.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        }
    }

    addMesh(mesh) {
        if (this.scene && mesh && !this.scene.children.includes(mesh)) {
            this.scene.add(mesh);
        }
    }

    checkAndDisplayObjects() {
        const interval = setInterval(() => {
            if (
                this.score1Mesh &&
                this.score2Mesh &&
                this.frontPaddle &&
                this.backPaddle &&
                this.ballMesh &&
                this.frontWall &&
                this.backWall &&
                this.rightWall &&
                this.leftWall &&
                this.tableModel &&
                this.number3Mesh &&
                this.number2Mesh &&
                this.number1Mesh &&
                this.number0Mesh &&
                this.startMesh &&
                this.profileBackMesh &&
                this.profileFrontMesh
            ) {
                // All objects are initialized, add them to the scene
                // this.addMesh(this.score1Mesh);
                // this.addMesh(this.score2Mesh);
                // this.addMesh(this.frontPaddle);
                // this.addMesh(this.backPaddle);
                // this.addMesh(this.ballMesh);
                // this.addMesh(this.frontWall);
                // this.addMesh(this.backWall);
                // this.addMesh(this.rightWall);
                // this.addMesh(this.leftWall);
                // this.addMesh(this.tableModel);
                // this.addMesh(this.profileBackMesh);
                // this.addMesh(this.profileFrontMesh);
                this.addMesh(this.number3Mesh);
                this.addMesh(this.startMesh);
                const requiredObjects = [
                    this.number3Mesh,
                    this.startMesh,
                ];
                if (this.isGameOver == true)
                    return;

                const interval2 = setInterval(() => {
                    if (this.isGameOver == true) {
                        clearInterval(interval2);
                        return;
                    }
                    // Check if all required objects are in the scene
                    const allAdded = requiredObjects.every((obj) => this.scene.children.includes(obj));

                    if (allAdded) {
                        // Stop checking
                        clearInterval(interval2);

                        // Play the countdown
                        this.playingCountDown();
                    }
                }, 100); // Check every 100ms
                this.intervals.push(interval2);

                // Stop the loop
                clearInterval(interval);
            }
        }, 100); // Check every 100ms
    }

    // Clear all intervals and timeouts
    clearAllTimers() {
        if (this.checkGameOver)
            this.intervals.push(this.checkGameOver);
        this.intervals.forEach((id) => clearInterval(id));
        this.timeouts.forEach((id) => clearTimeout(id));
        this.intervals = [];
        this.timeouts = [];
    }

    playingCountDown() {

        // Play the countdown sound
        // if (this.playerSide == "left")
        console.log("playingCountDown");
        console.log(this.camera.position.y);
        this.countDownSound.play();

        // Remove number3Mesh after sound starts
        this.timeouts.push(setTimeout(
            () => {
                this.removeMesh(this.number3Mesh);
                if (this.isGameOver == true)
                    return;
                this.addMesh(this.number2Mesh);

                this.timeouts.push(setTimeout(
                    () => {
                        this.removeMesh(this.number2Mesh);
                        if (this.isGameOver == true)
                            return;
                        this.addMesh(this.number1Mesh);

                        this.timeouts.push(setTimeout(() => {
                            this.removeMesh(this.number1Mesh);
                            if (this.isGameOver == true)
                                return;
                            this.addMesh(this.number0Mesh);
                            this.timeouts.push(setTimeout(() => {
                                if (this.isGameOver == true) {
                                    this.removeMesh(this.number0Mesh);
                                    return;
                                }
                                this.gameStartFunc();
                            }, 1000)
                            )
                        }, 1000)
                        )
                    }, 1000)
                )
            }, 1000)
        )
    }

}