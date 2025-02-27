import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { myFetch, BACKEND_URL } from "../../../utils/apiRequest.js";
import {
    Font,
    FontLoader,
} from "../../../../node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "../../../../node_modules/three/examples/jsm/loaders/TTFLoader.js";
import { TextGeometry } from "../../../../node_modules/three/examples/jsm/geometries/TextGeometry.js";
// from '../../../build/three.module.js';
import { get_valid_access_token } from "../../../utils/apiRequest.js";


export async function init_socket(url) {
    let accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        accessToken = await refresh();
    // const socket = new WebSocket(url, [`Authorization.${await get_valid_access_token()}`]);
    }
    const socket = new WebSocket(`${url}/?token=${accessToken}`);
  // const socket = new WebSocket(url);v
    await new Promise((resolve) => {
        socket.onopen = () => {
            resolve();
        };
    });
    return socket;
}


export class Game {
    constructor(canvasParent, socket, gamaDisplayer) {
        gamaDisplayer.game = this;
        this.socket = socket;
        this.canvasParent = canvasParent;
        this.registerEvents();
        this.gamaDisplayer = gamaDisplayer;
        this.waitingSound = null;
        this.isRunning = true;
        this.isGameOver = false;
        this.playersInfo = {
            playerFront: null,
            playerBack: null,
            playerFrontScore: 0,
            playerBackScore: 0,
            playerFrontAvatar: null,
            playerBackAvatar: null,
        };
        this.scores = {
            playerFront: 0,
            playerBack: 0,
        };
        this.intervals = [];
        this.timeouts = [];
        // this.setWaitingSound();
    }
    registerEvents() {
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_start") {
                this.gamaDisplayer.$updateState({
                    loading: false,
                    hasInvite: false,
                });
                this.playersInfo.playerBackAvatar = data.playerBackData.avatar;
                this.playersInfo.playerFrontAvatar =
                    data.playerFrontData.avatar;
                this.playersInfo.playerBack = data.playerBackData.display_name;
                this.playersInfo.playerFront =
                    data.playerFrontData.display_name;
                this.playersInfo.playerBackScore = data.playerBackData.score;
                this.playersInfo.playerFrontScore = data.playerFrontData.score;
                // this.stopWaitingSound();
                this.createScene(data);
                this.CountDown3Dobjects(data);
                this.initGame(data);
                this.checkAndDisplayObjects();
                this.game_loop();
            } else if (data.type === "game_state") {
                if (this.gameStart) {
                    this.paddle.back.x = data.paddleBack.x;
                    this.paddle.front.x = data.paddleFront.x;
                    this.ball = data.ball;
                    this.updateScore(data.scores);
                    this.updateSound(data.sound);
                }
            } else if (data.type === "game_over") {
                this.isGameOver = true;
                this.playersInfo.playerFrontScore = data.scores.playerFront;
                this.playersInfo.playerBackScore = data.scores.playerBack;
                this.gameOver(data.winner);
            } 
            // else if (data.type === "game_error") {
            //     if (data.error_type === "unauthorized") {
            //         this.isGameOver = true;
            //         console.log(data.error)
            //         this.gameOver(this.playerSide);
            //         this.gamaDisplayer.$emit("unauthorized")
            //     }
            // }
        };
        this.socket.onclose = () => {
            if (this.isGameOver) return;
            this.clearAllTimers();
            this.isGameOver = true;
            this.playersInfo.playerFrontScore = this.scores.playerFront;
            this.playersInfo.playerBackScore = this.scores.playerBack;
            this.gamaDisplayer.$updateState({
                gameOver: true,
                isWinner: "left" === this.playerSide,
                playersInfo: this.playersInfo,
            });
            // if (this.playerSide == "left")
            //   this.gameOver("right");
            // else
            //   this.gameOver("left");
        };
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
                this.frameMesh &&
                this.pictureMesh &&
                this.frameMesh2 &&
                this.pictureMesh2 &&
                this.number3Mesh &&
                this.number2Mesh &&
                this.number1Mesh &&
                this.number0Mesh &&
                this.startMesh &&
                this.VS_Mesh &&
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

                this.addMesh(this.frameMesh);
                this.addMesh(this.pictureMesh);
                this.addMesh(this.frameMesh2);
                this.addMesh(this.pictureMesh2);
                this.addMesh(this.number3Mesh);
                this.addMesh(this.startMesh);
                this.addMesh(this.VS_Mesh);
                this.addMesh(this.profileBackMesh);
                this.addMesh(this.profileFrontMesh);
                const requiredObjects = [
                    this.frameMesh,
                    this.pictureMesh,
                    this.frameMesh2,
                    this.pictureMesh2,
                    this.number3Mesh,
                    this.startMesh,
                    this.VS_Mesh,
                    this.profileBackMesh,
                    this.profileFrontMesh,
                ];
                if (this.isGameOver == true) return;
                const interval2 = setInterval(() => {
                    if (this.isGameOver == true) {
                        clearInterval(interval2);
                        return;
                    }
                    // Check if all required objects are in the scene
                    const allAdded = requiredObjects.every((obj) =>
                        this.scene.children.includes(obj)
                    );
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
        this.intervals.forEach((id) => clearInterval(id));
        this.timeouts.forEach((id) => clearTimeout(id));
        this.intervals = [];
        this.timeouts = [];
    }
    playingCountDown() {
        // Play the countdown sound
        // if (this.playerSide == "left")
        this.countDownSound.play();

        // Remove number3Mesh after sound starts
        this.timeouts.push(
            setTimeout(() => {
                this.removeMesh(this.number3Mesh);
                if (this.isGameOver == true) return;
                this.addMesh(this.number2Mesh);
                this.timeouts.push(
                    setTimeout(() => {
                        this.removeMesh(this.number2Mesh);
                        if (this.isGameOver == true) return;
                        this.addMesh(this.number1Mesh);
                        this.timeouts.push(
                            setTimeout(() => {
                                this.removeMesh(this.number1Mesh);
                                if (this.isGameOver == true) return;
                                this.addMesh(this.number0Mesh);
                                this.timeouts.push(
                                    setTimeout(() => {
                                        if (this.isGameOver == true) {
                                            this.removeMesh(this.number0Mesh);
                                            return;
                                        }
                                        this.gameStartFunc();
                                    }, 1000)
                                );
                            }, 1000)
                        );
                    }, 1000)
                );
            }, 1000)
        );
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
    startGame() {
        this.socket.send(
            JSON.stringify({
                type: "player",
                key: "ready",
            })
        );

        // this.gameStart = true;
    }
    gameStartFunc() {
        if (this.isGameOver == true) return;
        this.removeMesh(this.frameMesh);
        this.removeMesh(this.pictureMesh);
        this.removeMesh(this.frameMesh2);
        this.removeMesh(this.pictureMesh2);
        this.removeMesh(this.number3Mesh);
        this.removeMesh(this.startMesh);
        this.removeMesh(this.VS_Mesh);
        this.removeMesh(this.profileBackMesh);
        this.removeMesh(this.profileFrontMesh);
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
        if (this.camera) this.camera.lookAt(0, 65, 0);
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
            if (this.isGameOver == true) return;
            // Check if all required objects are in the scene
            const allAdded = requiredObjects.every((obj) =>
                this.scene.children.includes(obj)
            );
            if (allAdded) {
                this.startGame();
                this.gameStart = true;
            }
        }, 100); // Check every 100ms
    }
    loadingFonts(data) {
        this.textFont = null;
        const loader = new TTFLoader();
        loader.load("./assets/source/kenpixel.ttf", (json) => {
            const font = new Font(json);
            this.textFont = font;
            this.adding3dText(data);
        });
        this.ScoreFont = null;
        const textloader = new FontLoader();
        textloader.load(
            "./assets/source/modes/Pong_Score_Regular.json",
            (loadedFont) => {
                const font = new Font(loadedFont);
                this.ScoreFont = font;
            }
        );
    }
    adding3dText(data) {
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
            emissive: 0x3ecddb,
            // Light-emitting color
            emissiveIntensity: 0.5, // Intensity of the light emission
        });
        const startMesh = new THREE.Mesh(startGeometry, startMaterial);

        // Center the text
        startGeometry.computeBoundingBox();
        const startBoundingBox = startGeometry.boundingBox;
        const startWidth = startBoundingBox.max.x - startBoundingBox.min.x;
        startMesh.position.set(
            -startWidth / 2,
            this.camera.position.y + 5,
            this.camera.position.z / 3
        );
        this.startMesh = startMesh;
        const VS_Text = "VS";
        const VS_Geometry = new TextGeometry(VS_Text, {
            font: this.textFont,
            size: 2.5,
            depth: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3,
        });
        const VS_Material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffd700,
            // Light-emitting color
            emissiveIntensity: 0.5, // Intensity of the light emission
        });
        const VS_Mesh = new THREE.Mesh(VS_Geometry, VS_Material);

        // Center the VS_ text
        VS_Geometry.computeBoundingBox();
        const VS_BoundingBox = VS_Geometry.boundingBox;
        const VS_Width = VS_BoundingBox.max.x - VS_BoundingBox.min.x;
        VS_Mesh.position.set(
            -VS_Width / 2,
            this.camera.position.y - 7,
            this.camera.position.z / 3
        );
        this.VS_Mesh = VS_Mesh;
        this.number0Mesh = this.get3dNumber("0");
        this.number1Mesh = this.get3dNumber("1");
        this.number2Mesh = this.get3dNumber("2");
        this.number3Mesh = this.get3dNumber("3");
        this.profileBackMesh = this.addPlayerName(
            data.playerBackData.display_name || "Player 1",
            -10
        );
        this.profileFrontMesh = this.addPlayerName(
            data.playerFrontData.display_name || "Player 2",
            10
        );
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
            emissive: 0xffd700,
            // Light-emitting color
            emissiveIntensity: 0.7, // Intensity of the light emission
        });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);

        // Center the number text
        numberGeometry.computeBoundingBox();
        const numberBoundingBox = numberGeometry.boundingBox;
        const numberWidth = numberBoundingBox.max.x - numberBoundingBox.min.x;
        numberMesh.position.set(
            -numberWidth / 2,
            this.camera.position.y,
            this.camera.position.z / 3
        );
        return numberMesh;
    }
    loadingProfiles(data) {
        const textureLoader = new THREE.TextureLoader();

        // Helper function to load and optimize textures
        const loadOptimizedTexture = (url) => {
            const texture = textureLoader.load(url);
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy(); // Max anisotropy for better quality
            texture.encoding = THREE.sRGBEncoding; // Use sRGB encoding for accurate colors
            texture.minFilter = THREE.LinearMipMapLinearFilter; // Smooth transitions between mipmaps
            texture.magFilter = THREE.LinearFilter; // High-quality magnification filter
            return texture;
        };

        // Load and optimize textures
        const profileImage = loadOptimizedTexture(
            `${BACKEND_URL}/auth/media/${data.playerFrontData.avatar}`
        );
        const profileImage2 = loadOptimizedTexture(
            `${BACKEND_URL}/auth/media/${data.playerBackData.avatar}`
        );

        // Create geometry and materials
        const pictureGeometry = new THREE.CircleGeometry(4, 64); // Increase segments for smoother edges
        const pictureMaterial = new THREE.MeshBasicMaterial({
            map: profileImage,
        });
        const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);
        const frameGeometry = new THREE.TorusGeometry(4.5, 0.5, 32, 128); // Increase segments for smoother frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3ecddb,
            emissive: 0x3ecddb,
            emissiveIntensity: 0.4,
        });
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        frameMesh.position.set(
            10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        pictureMesh.position.set(
            10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        const frameMesh2 = frameMesh.clone();
        const pictureMaterial2 = new THREE.MeshBasicMaterial({
            map: profileImage2,
        });
        const pictureMesh2 = new THREE.Mesh(pictureGeometry, pictureMaterial2);
        frameMesh2.position.set(
            -10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        pictureMesh2.position.set(
            -10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );

        // Add frame and profile picture to the scene
        this.frameMesh = frameMesh;
        this.pictureMesh = pictureMesh;
        this.frameMesh2 = frameMesh2;
        this.pictureMesh2 = pictureMesh2;
    }
    CountDown3Dobjects(data) {
        this.loadingFonts(data);
        this.loadingProfiles(data);
    }
    createScene(data) {
        this.gameBlock = document.createElement("canvas");
        this.gameBlock = this.canvasParent.appendChild(this.gameBlock);
        this.gameBlock.width = this.gameBlock.parentElement.clientWidth;
        this.gameBlock.height = this.gameBlock.parentElement.clientHeight;
        const renderer = new THREE.WebGLRenderer({
            canvas: this.gameBlock,
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
        const camera = new THREE.PerspectiveCamera(
            75,
            this.gameBlock.width / this.gameBlock.height,
            0.1,
            1000
        );
        this.camera = camera;
        this.camera.aspect =
            this.canvasParent.clientWidth / this.canvasParent.clientHeight;
        this.renderer.setSize(
            this.canvasParent.clientWidth,
            this.canvasParent.clientHeight
        );
        if (this.canvasParent.clientWidth <= 428) {
            this.camera.position.set(
                0,
                95 + 95 * (40 / this.canvasParent.clientWidth),
                46 + 46 * (40 / this.canvasParent.clientWidth)
            );
        } else this.camera.position.set(0, 95, 46);
        this.camera.lookAt(0, this.camera.position.y, 0);
        this.camera.updateProjectionMatrix();
    }
    addBackGround() {
        const SphereGeometry = new THREE.SphereGeometry(500, 1, 1);
        const SphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x254a59,
            // 0x0a1926,
            side: THREE.BackSide,
        });
        this.sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
        this.sphere.position.set(0, 0, 0);
        this.addMesh(this.sphere);
    }
    startCountDown(data) {
        // Load profile image texture
        const textureLoader = new THREE.TextureLoader();
        const profileImage = textureLoader.load(
            `${BACKEND_URL}/auth/media/${data.profileFront.avatar}`
        );

        // Create plane for profile picture (center of the frame)
        const pictureGeometry = new THREE.CircleGeometry(4, 32); // Size of the profile picture
        const pictureMaterial = new THREE.MeshBasicMaterial({
            map: profileImage,
        });
        const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);

        // Create frame around the profile picture
        const frameGeometry = new THREE.TorusGeometry(4.5, 0.5, 16, 100); // Slightly larger than the profile picture
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3ecddb,
            // metalness: 0.6,  // High metalness for reflective effect
            // roughness: 0.2,  // Low roughness for a shiny surface
            emissive: 0x3ecddb,
            // Light-emitting color
            emissiveIntensity: 0.4, // Intensity of the light emission
        }); // Brown color for the frame
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        frameMesh.position.set(
            10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        pictureMesh.position.set(
            10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        const frameMesh2 = frameMesh.clone();
        const profileImage2 = textureLoader.load(
            `${BACKEND_URL}/auth/media/${data.profileBack.avatar}`
        );
        const pictureMaterial2 = new THREE.MeshBasicMaterial({
            map: profileImage2,
        });
        const pictureMesh2 = new THREE.Mesh(pictureGeometry, pictureMaterial2);
        frameMesh2.position.set(
            -10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );
        pictureMesh2.position.set(
            -10,
            this.camera.position.y - 5,
            this.camera.position.z / 3
        );

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
            depth: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3,
        });
        const nameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x3ecddb,
            // Light-emitting color
            emissiveIntensity: 0.2, // Intensity of the light emission
        });
        const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
        nameGeometry.computeBoundingBox();
        const nameWidth =
            nameGeometry.boundingBox.max.x - nameGeometry.boundingBox.min.x;

        // Position the name below the frame
        nameMesh.position.set(
            xPosition - nameWidth / 2,
            this.camera.position.y - 13,
            this.camera.position.z / 3
        );
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
            bevelSegments: 5,
        });
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
        });
        return new THREE.Mesh(textGeometry, textMaterial);
    }
    updateSound(sound) {
        if (sound == "goal") this.goalSound.play();
        if (sound == "paddle") this.paddleHitSound.play();
        if (sound == "wall") this.wallHitSound.play();
    }
    updateScore(score) {
        if (this.scores.playerFront != score.playerFront) {
            this.scores.playerFront = score.playerFront;
            this.removeMesh(this.score1Mesh); // Remove old score mesh
            this.score1Mesh = this.createScoreText(this.scores.playerFront);
            this.score1Mesh.rotation.z = -Math.PI / 2;
            this.score1Mesh.rotation.x = -Math.PI / 2;
            this.score1Mesh.position.set(13.2, 65, 4);
            this.addMesh(this.score1Mesh);
        } else if (this.scores.playerBack != score.playerBack) {
            this.scores.playerBack = score.playerBack;
            this.removeMesh(this.score2Mesh); // Remove old score mesh
            this.score2Mesh = this.createScoreText(this.scores.playerBack);
            this.score2Mesh.rotation.z = -Math.PI / 2;
            this.score2Mesh.rotation.x = -Math.PI / 2;
            this.score2Mesh.position.set(13.2, 65, -7.4);
            this.addMesh(this.score2Mesh);
        }
    }
    initGame(data) {
        this.paddle = {
            front: {
                x: 0,
                z: 25,
            },
            back: {
                x: 0,
                z: -25,
            },
        };
        this.scores = {
            playerFront: 0,
            playerBack: 0,
        };
        this.ball = data.ball;
        this.playerSide = data.player_side;
        this.lightning();
        this.create3Dobjects();
        this.addSoundEffects();
        window.addEventListener("keydown", (event) => {
            this.keydownHandler(event);
        });
        window.addEventListener("keyup", (event) => {
            this.keyupHandler(event);
        });
        window.addEventListener("resize", () => this.resizeHandler);
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
    keyupHandler(event) {
        const key = event.key;
        if (key == "ArrowRight")
            this.socket.send(
                JSON.stringify({
                    type: "key_up",
                    key: "ArrowRight",
                })
            );
        else if (key == "ArrowLeft")
            this.socket.send(
                JSON.stringify({
                    type: "key_up",
                    key: "ArrowLeft",
                })
            );
    }
    keydownHandler(event) {
        const key = event.key;
        if (key == "ArrowRight")
            this.socket.send(
                JSON.stringify({
                    type: "key_down",
                    key: "ArrowRight",
                })
            );
        else if (key == "ArrowLeft")
            this.socket.send(
                JSON.stringify({
                    type: "key_down",
                    key: "ArrowLeft",
                })
            );
    }
    resizeHandler() {
        this.camera.aspect =
            this.canvasParent.clientWidth / this.canvasParent.clientHeight;
        this.renderer.setSize(
            this.canvasParent.clientWidth,
            this.canvasParent.clientHeight
        );
        if (this.canvasParent.clientWidth <= 428) {
            this.camera.position.set(
                0,
                95 + 95 * (30 / this.canvasParent.clientWidth),
                46 + 46 * (30 / this.canvasParent.clientWidth)
            );
        } else this.camera.position.set(0, 95, 46);
        this.camera.updateProjectionMatrix();
    }
    lightning() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.castShadow = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
        light.position.set(0, 2000, 0);
        this.light = light;
        this.addMesh(light);
        this.light.position.set(
            0,
            this.camera.position.y,
            this.camera.position.z + 5
        );
        const lightAmbient = new THREE.AmbientLight(0x404040); // soft white light
        this.addMesh(lightAmbient);
    }
    create3Dobjects() {
        const textloader = new FontLoader();
        textloader.load(
            "./assets/source/modes/Pong_Score_Regular.json",
            (loadedFont) => {
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
                    bevelSegments: 5,
                });
                this.textGeometry = textGeometry;
                const textMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.2,
                });
                this.textMaterial = textMaterial;
                this.score1Mesh = new THREE.Mesh(
                    this.textGeometry,
                    this.textMaterial
                );
                this.score1Mesh.position.set(13.5, 65, 2.5);
                this.score1Mesh.scale.set(1.5, 1, 1);
                this.score1Mesh.rotation.z = -Math.PI / 2;
                this.score1Mesh.rotation.x = -Math.PI / 2;
                this.score2Mesh = new THREE.Mesh(
                    this.textGeometry,
                    this.textMaterial
                );
                this.score2Mesh.position.set(13.5, 65, -8.9);
                this.score2Mesh.scale.set(1.5, 1, 1);
                this.score2Mesh.rotation.z = -Math.PI / 2;
                this.score2Mesh.rotation.x = -Math.PI / 2;
            }
        );
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
        this.backPaddle.position.set(this.paddle.back.x, 65, -25);

        // Right paddle
        this.frontPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        // Position it on the right side
        this.frontPaddle.position.set(this.paddle.front.x, 65, 25);
        const WallGeometry = new THREE.BoxGeometry(37, 1, 1);
        const WallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
        });
        this.backWall = new THREE.Mesh(WallGeometry, WallMaterial);
        this.backWall.position.set(0, 64.9, -27);
        this.frontWall = new THREE.Mesh(WallGeometry, WallMaterial);
        this.frontWall.position.set(0, 64.9, 27);
        const sideWallGeometry = new THREE.BoxGeometry(1, 1, 55);
        this.leftWall = new THREE.Mesh(sideWallGeometry, WallMaterial);
        this.leftWall.position.set(-18, 64.9, 0);
        this.rightWall = new THREE.Mesh(sideWallGeometry, WallMaterial);
        this.rightWall.position.set(18, 64.9, 0);
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
    setWaitingSound() {
        this.waitingSound = new Audio("./assets/source/waiting.mp3");
        this.waitingSound.loop = true; // Enable looping
        this.waitingSound.volume = 0.5;
        this.waitingSound.play().catch((error) => {
            console.error("Error playing waiting sound:", error);
        });
    }
    stopWaitingSound() {
        if (this.waitingSound) {
            this.waitingSound.pause();
            this.waitingSound.currentTime = 0; // Reset the playback position
        }
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
            "./assets/source/paddle_hit.mp3",
            (buffer) => {
                this.paddleHitSound.setBuffer(buffer);
                this.paddleHitSound.setLoop(false);
                this.paddleHitSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error("Error loading sound:", error);
            }
        );
        this.audioLoader.load(
            "./assets/source/goal.mp3",
            (buffer) => {
                this.goalSound.setBuffer(buffer);
                this.goalSound.setLoop(false);
                this.goalSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error("Error loading sound:", error);
            }
        );
        this.audioLoader.load(
            "./assets/source/wall_hit.mp3",
            (buffer) => {
                this.wallHitSound.setBuffer(buffer);
                this.wallHitSound.setLoop(false);
                this.wallHitSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error("Error loading sound:", error);
            }
        );
        this.audioLoader.load(
            "./assets/source/game-countdown.mp3",
            (buffer) => {
                this.countDownSound.setBuffer(buffer);
                this.countDownSound.setLoop(false);
                this.countDownSound.setVolume(0.5);
            },
            undefined,
            function (error) {
                console.error("Error loading sound:", error);
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
        if (this.frameMesh) this.removeMesh(this.frameMesh);
        if (this.pictureMesh) this.removeMesh(this.pictureMesh);
        if (this.frameMesh2) this.removeMesh(this.frameMesh2);
        if (this.pictureMesh2) this.removeMesh(this.pictureMesh2);
        if (this.number3Mesh) this.removeMesh(this.number3Mesh);
        if (this.startMesh) this.removeMesh(this.startMesh);
        if (this.VS_Mesh) this.removeMesh(this.VS_Mesh);
        if (this.profileBackMesh) this.removeMesh(this.profileBackMesh);
        if (this.profileFrontMesh) this.removeMesh(this.profileFrontMesh);
        if (this.number0Mesh) this.removeMesh(this.number0Mesh);
        if (this.number1Mesh) this.removeMesh(this.number1Mesh);
        if (this.number2Mesh) this.removeMesh(this.number2Mesh);

        // if (this.score1Mesh) {
        //   this.removeMesh(this.score1Mesh);
        //   this.score1Mesh = null;
        // }
        // if (this.score2Mesh) {
        //   this.removeMesh(this.score2Mesh);
        //   this.score2Mesh = null;
        // }
        // if (this.ballMesh) {
        //   this.removeMesh(this.ballMesh);
        //   this.ballMesh = null;
        // }
        // if (this.backPaddle) {
        //   this.removeMesh(this.backPaddle);
        //   this.backPaddle = null;
        // }
        // if (this.frontPaddle) {
        //   this.removeMesh(this.frontPaddle);
        //   this.frontPaddle = null;
        // }
        // if (this.backWall) {
        //   this.removeMesh(this.backWall);
        //   this.backWall = null;
        // }
        // if (this.frontWall) {
        //   this.removeMesh(this.frontWall);
        //   this.frontWall = null;
        // }
        // if (this.leftWall) {
        //   this.removeMesh(this.leftWall);
        //   this.leftWall = null;
        // }
        // if (this.rightWall) {
        //   this.removeMesh(this.rightWall);
        //   this.rightWall = null;
        // }
        // if (this.tableModel) {
        //   this.removeMesh(this.tableModel);
        //   this.tableModel = null;
        // }
    }
    gameOver(winner) {
        // Stop all sounds
        this.stopAllSounds();

        // Remove all 3D objects from the scene
        this.clearScene();

        // Transition to the game over state
        this.playingGameOver(winner === this.playerSide);

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
        this.gameOverSound = new Audio("./assets/source/game-over-sound.mp3");
        this.gameOverSound.loop = false;
        this.gameOverSound.volume = 0.5;
        this.gameOverSound.play().catch((error) => {
            console.error("Error playing gameOver sound:", error);
            this.closeGame(winner);
        });
        this.gameOverSound2 = new Audio("./assets/source/game-over.mp3");
        this.gameOverSound2.loop = false;
        this.gameOverSound2.volume = 0.5;
        this.gameOverSound.addEventListener("ended", () => {
            console.log("First gameOverSound finished...");
            this.gameOverSound2.play().catch((error) => {
                console.error("Error playing gameOver2 sound:", error);
            });
            this.gameOverSound2.addEventListener("ended", () => {
                console.log("Second gameOverSound finished, closing game...");
                this.closeGame(winner);
            });
        });
    }
    closeGame(winner) {
        console.log("Entering closeGame...");
        if (!this.canvasParent || !this.gameBlock) {
            console.error("Canvas parent or game block is null.", {
                canvasParent: this.canvasParent,
                gameBlock: this.gameBlock,
            });
            return;
        }
        try {
            this.canvasParent.removeChild(this.gameBlock);
            console.log("Game canvas removed.");
        } catch (error) {
            console.error("Error removing game canvas:", error);
        }
        console.log("Checking gamaDisplayer:", this.gamaDisplayer);
        if (!this.gamaDisplayer) {
            console.error("gamaDisplayer is null or undefined.");
            return;
        }
        console.log("Validating playersInfo:", this.playersInfo);
        if (!this.playersInfo.playerFront || !this.playersInfo.playerBack) {
            console.error("Invalid playersInfo data:", this.playersInfo);
            return;
        }
        setTimeout(() => {
            try {
                this.gamaDisplayer.$updateState({
                    gameOver: true,
                    isWinner: winner === this.playerSide,
                    playersInfo: this.playersInfo,
                });
                console.log("State updated successfully.");
            } catch (error) {
                console.error("Error updating state:", error);
            }
        }, 100); // 100ms delay

        console.log("Game Over2");
    }

    // closeGame(winner) {
    //   this.canvasParent.removeChild(this.gameBlock);
    //   console.log("Game Over");
    //   this.gamaDisplayer.$updateState({
    //     gameOver: true,
    //     isWinner: winner == this.playerSide,
    //     playersInfo: this.playersInfo
    //   });
    //   console.log("Game Over2");
    // }

    playingGameOver(isWinner) {
        this.resizeHandler();
        this.light.position.set(
            0,
            this.camera.position.y,
            this.camera.position.z + 5
        );
        this.textFont = null;
        let winnerText = null;
        const loader = new TTFLoader();
        if (isWinner == true) winnerText = "YOU WON";
        else winnerText = "YOU LOST";
        loader.load("./assets/source/kenpixel.ttf", (json) => {
            const font = new Font(json);
            this.textFont = font;
            const isWinnerGeometry = new TextGeometry(winnerText, {
                font: this.textFont,
                size: 1.8,
                depth: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 3,
            });
            const isWinnerMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
            });
            const winnerMesh = new THREE.Mesh(
                isWinnerGeometry,
                isWinnerMaterial
            );

            // Center the text
            isWinnerGeometry.computeBoundingBox();
            const winnerBoundingBox = isWinnerGeometry.boundingBox;
            const winnerWidth =
                winnerBoundingBox.max.x - winnerBoundingBox.min.x;
            winnerMesh.position.set(
                -winnerWidth / 2,
                this.camera.position.y - 5,
                this.camera.position.z / 3
            );
            this.addMesh(winnerMesh);
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
            const GameOverMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700,
            });
            const GameOverMesh = new THREE.Mesh(
                GameOverGeometry,
                GameOverMaterial
            );

            // Center the GameOver text
            GameOverGeometry.computeBoundingBox();
            const GameOverBoundingBox = GameOverGeometry.boundingBox;
            const GameOverWidth =
                GameOverBoundingBox.max.x - GameOverBoundingBox.min.x;
            GameOverMesh.position.set(
                -GameOverWidth / 2,
                this.camera.position.y,
                this.camera.position.z / 3
            );
            this.addMesh(GameOverMesh);
            this.camera.lookAt(0, this.camera.position.y, 0);
        });
    }
    updatePositions() {
        this.ballMesh.position.set(this.ball.x, 65, this.ball.z);
        this.backPaddle.position.set(this.paddle.back.x, 65, -25);
        this.frontPaddle.position.set(this.paddle.front.x, 65, 25);
    }
    game_loop() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.game_loop());
        if (this.gameStart) this.updatePositions();
        this.renderer.render(this.scene, this.camera);
    }
    calculateZ(x) {
        // Calculer y en fonction de x
        let z = Math.sqrt(2116 - x * x);
        return z;
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

        // Traverse and dispose objects in the scene
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
        // this.stopAllSounds();
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
}
