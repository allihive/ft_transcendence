import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

import backgroundImg from './assets/backgroundStage.png'; // Importing the background image


export const createScene = (
  engine: Engine,
  canvas: HTMLCanvasElement,
  players: { id: string; username: string; score: number }[],
  ballRef: React.RefObject<Mesh | null>,
  paddle1Ref: React.RefObject<Mesh | null>,
  paddle2Ref: React.RefObject<Mesh | null>,
  groupRef: React.RefObject<TransformNode | null>,
  topwall1Ref: React.RefObject<Mesh | null>,
  topwall2Ref: React.RefObject<Mesh | null>,
  setPlayers: React.Dispatch<React.SetStateAction<{ id: string; username: string; score: number }[]>>
): { scene: Scene; player1ScoreText: TextBlock; player2ScoreText: TextBlock }  => {
  const scene = new Scene(engine);

  // Camera setup
  const cameraX = -5, cameraY = 4, cameraZ = -14;
  const camera = new FreeCamera('camera1', new Vector3(cameraX, cameraY, cameraZ), scene);
  camera.position.set(cameraX, cameraY, cameraZ - 1);
  camera.inputs.clear();
  camera.fov = 0.5;
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 2.0;

  // Background setup
  const backgroundMaterial = new StandardMaterial("backgroundMaterial", scene);
  const texture = new Texture(backgroundImg, scene);
  texture.uScale = 1;
  texture.vScale = 1;
  backgroundMaterial.diffuseTexture = texture;
  backgroundMaterial.backFaceCulling = false;

  const backgroundPlane = MeshBuilder.CreatePlane("background", { width: 50, height: 30 }, scene);
  backgroundPlane.material = backgroundMaterial;
  backgroundPlane.position.z = 9;
  backgroundPlane.position.y = 2;
  backgroundPlane.position.x = 13;

  // Group for all game elements
  const group = new TransformNode("group", scene);
  groupRef.current = group;

  // Ball setup
  const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.4, segments: 32 }, scene);
  ball.parent = group;
  ball.position.y = 0.1;
  const ballMaterial = new StandardMaterial('ballMat', scene);
  ballMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
  ball.material = ballMaterial;
  ballRef.current = ball;

  // Paddle setup
  const paddleWidth = 1, paddleHeight = 0.4, paddleDepth = 0.3;
  const paddle1 = MeshBuilder.CreateBox('paddle1', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
  paddle1.parent = group;
  paddle1.position = new Vector3(0, 0.1, 5);
  const paddle1Material = new StandardMaterial('redPaddleMat', scene);
  paddle1Material.diffuseColor = new Color3(1, 0, 0); // Red
  paddle1.material = paddle1Material;
  paddle1Ref.current = paddle1;

  const paddle2 = MeshBuilder.CreateBox('paddle2', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
  paddle2.parent = group;
  paddle2.position = new Vector3(0, 0.1, -5);
  const paddle2Material = new StandardMaterial('blackPaddleMat', scene);
  paddle2Material.diffuseColor = new Color3(0, 0, 1); // Black
  paddle2.material = paddle2Material;
  paddle2Ref.current = paddle2;

  // Ground setup
  const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 12 }, scene);
  ground.parent = group;
  const groundMaterial = new StandardMaterial('groundMat', scene);
  groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Gray
  groundMaterial.alpha = 0.1;
  ground.material = groundMaterial;
  ground.position.y = 0;

  // Side walls
  const sidewallMaterial = new StandardMaterial('wallMat', scene);
  sidewallMaterial.diffuseColor = new Color3(0.8, 0, 1);
  sidewallMaterial.alpha = 0.3;

  const sidewall1 = MeshBuilder.CreateBox('sidewall1', { width: 0.1, height: 0.4, depth: 12 }, scene);
  sidewall1.parent = group;
  sidewall1.material = sidewallMaterial;
  sidewall1.position = new Vector3(4.05, 0.2, 0);

  const sidewall2 = sidewall1.clone("sidewall2", null);
  sidewall2.position = new Vector3(-4.05, 0.2, 0);
  sidewall2.parent = group;

  // Top walls
  const topwall1 = MeshBuilder.CreateBox('topwall1', { width: 8, height: 0.4, depth: 0.02 }, scene);
  topwall1.parent = group;
  topwall1.position.y = 0.2;
  topwall1.position.z = -6;
  const topwall1Mat = new StandardMaterial('topwallMat', scene);
  topwall1Mat.diffuseColor = new Color3(1, 1, 0); // Yellow
  topwall1Mat.alpha = 0.2;
  topwall1.material = topwall1Mat;
  topwall1Ref.current = topwall1;


  const topwall2 = topwall1.clone("topwall2", null);
  topwall2.position = new Vector3(0, 0.2, 6);
  topwall2.parent = group;
  const topwall2Mat = new StandardMaterial("topwall2Material", scene);
  topwall2Mat.diffuseColor = new Color3(1, 1, 0);
  topwall2Mat.alpha = 0.2;
  topwall2.material = topwall2Mat;
  topwall2Ref.current = topwall2;

  // Set up the GUI for displaying scores
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  // Score UI player 1
  const player1ScoreText = new TextBlock();
  player1ScoreText.text = `${players[0].username}: ${players[0].score}`;
  player1ScoreText.color = "white";
  player1ScoreText.fontSize = 24;
  player1ScoreText.textHorizontalAlignment = 0;
  player1ScoreText.textVerticalAlignment = 0;
  player1ScoreText.left = "10px";
  player1ScoreText.top = "10px";
  advancedTexture.addControl(player1ScoreText);

  // UI player 2
  const player2ScoreText = new TextBlock();
  player2ScoreText.text = `${players[1].username}: ${players[1].score}`;
  player2ScoreText.color = "white";
  player2ScoreText.fontSize = 24;
  player2ScoreText.textHorizontalAlignment = 1;
  player2ScoreText.textVerticalAlignment = 0;
  player2ScoreText.left = "calc(100% - 10px)";
  player2ScoreText.top = "10px";
  advancedTexture.addControl(player2ScoreText);

  // Update the score UI when players score
  const updateScoreUI = () => {
    player1ScoreText.text = `${players[0].username}: ${players[0].score}`;
    player2ScoreText.text = `${players[1].username}: ${players[1].score}`;
  };

  updateScoreUI();

  return {
	scene,
	player1ScoreText,
	player2ScoreText,
  };
};
