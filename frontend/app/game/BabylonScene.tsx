import React, { useEffect, useRef } from 'react';
import { Texture, Mesh, Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, TransformNode } from 'babylonjs';
import { startBallMovement } from './ballMovement'; 
import { paddleMovement } from './paddleMovement';
import "./Scene.css";
import backgroundImg from './assets/backgroundStage.png';

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paddle1Ref = useRef<Mesh | null>(null);
  const blackPaddleRef = useRef<Mesh | null>(null);
  const groupRef = useRef<TransformNode | null>(null);
  const topwall1Ref = useRef<Mesh | null>(null);
  const topwall2Ref = useRef<Mesh | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = createScene(engine, canvasRef.current);
      
      //create the background pic to Plane and set position
      const backgroundMaterial = new StandardMaterial("backgroundMaterial", scene);
      const texture = new Texture(backgroundImg, scene);
      texture.uScale = 1;
      texture.vScale = 1;
      backgroundMaterial.diffuseTexture = texture;
      backgroundMaterial.backFaceCulling = false;;
  

      const backgroundPlane = MeshBuilder.CreatePlane("background", { width: 50, height: 30 }, scene);
      backgroundPlane.material = backgroundMaterial;
      backgroundPlane.position.z = 9;
      backgroundPlane.position.y = 2;
      backgroundPlane.position.x = 13; 

      //set the game walls, ball and paddles so that it looks 3D against background pic
      if (groupRef.current) {
        groupRef.current.position.set(0, 0, 2.5);
        groupRef.current.rotation.x = Math.PI / 120; 
        groupRef.current.rotation.y = - (Math.PI / 32); 
        groupRef.current.rotation.z = 0;  
      }
      
      engine.runRenderLoop(() => {
        scene.render();
      });

      paddleMovement(paddle1Ref, blackPaddleRef, 0.1); 

      window.addEventListener('resize', () => {
        engine.resize();
      });

      return () => {
        scene.dispose();
        engine.dispose();
      };
    }
  }, []);

  const createScene = (engine: Engine, canvas: HTMLCanvasElement): Scene => {
    const scene = new Scene(engine);

    let cameraX = -5;
    let cameraY = 4;
    let cameraZ = -14;

    const camera = new FreeCamera('camera1', new Vector3(cameraX, cameraY, cameraZ), scene);

    const cameraDistance = 1;
    camera.position.set(cameraX, cameraY, cameraZ - cameraDistance);
    camera.inputs.clear(); 

    camera.fov = 0.5;
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 2.0;


    //this is a group for all game walls, baddles and ball so it is easier to move and rotate all together
    const group = new TransformNode("group", scene);
    groupRef.current = group; 

    //create ball
    const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.4, segments: 32 }, scene);
    ball.parent = group;
    ball.position.y = 0.1;

    const ballMaterial = new StandardMaterial('ballMat', scene);
    ballMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8); 
    ball.material = ballMaterial;


    //create paddles
    const paddleWidth = 1;
    const paddleHeight = 0.4;
    const paddleDepth = 0.3;

    const paddle1 = MeshBuilder.CreateBox('paddle1', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
    paddle1.parent = group;
    paddle1.position = new Vector3(0, 0.1, 5); 
    const paddle1Material = new StandardMaterial('redPaddleMat', scene);
    paddle1Material.diffuseColor = new Color3(0.6, 0.8, 1); // Red
    paddle1.material = paddle1Material;
    paddle1Ref.current = paddle1;

    const paddle2 = MeshBuilder.CreateBox('paddle2', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
    paddle2.parent = group;
    paddle2.position = new Vector3(0, 0.1, -5);
    const paddle2Material = new StandardMaterial('blackPaddleMat', scene);
    paddle2Material.diffuseColor = new Color3(0.3, 0.3, 0.3); // Black
    paddle2.material = paddle2Material;
    blackPaddleRef.current = paddle2;

    // Create ground
    const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 12 }, scene);
    ground.parent = group;
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Gray
    groundMaterial.alpha = 0.1; // Set opacity to 30% (0 = fully transparent, 1 = fully opaque)
    groundMaterial.alphaMode = 2; 
    ground.material = groundMaterial;
    ground.position.y = 0;

    //create walls
    // Shared sidewall material
    const sidewallMaterial = new StandardMaterial('wallMat', scene);
    sidewallMaterial.diffuseColor = new Color3(0.8, 0, 1);
    sidewallMaterial.alpha = 0.3;
    sidewallMaterial.alphaMode = 2;
  

    const sidewall1 = MeshBuilder.CreateBox('sidewall1', { width: 0.1, height: 0.4, depth: 12 }, scene);
    sidewall1.parent = group;
    sidewall1.material = sidewallMaterial;
    sidewall1.position = new Vector3(4.05, 0.2, 0);

    const sidewall2 = sidewall1.clone("sidewall2", null);
    if (sidewall2) {
      sidewall2.position = new Vector3(-4.05, 0.2, 0);
      sidewall2.parent = group;
    }
    
    // Create the top walls
    const topwall1 = MeshBuilder.CreateBox('topwall1', { width: 8, height: 0.4, depth: 0.02 }, scene);
    topwall1.parent = group;
    topwall1.position.y = 0.2;
    topwall1.position.z = -6;
    topwall1.position.x = 0;
    const topwall1Material = new StandardMaterial('topwallMat', scene);
   
    topwall1Material.alpha = 0.2;

    topwall1Material.diffuseColor = new Color3(1, 1, 0); 
    topwall1.material = topwall1Material;
    topwall1Ref.current = topwall1;


    const topwall2 = topwall1.clone("topwall2", null);
    if (topwall2) {
      topwall2.position = new Vector3(0, 0.2, 6);
      topwall2.parent = group;

      const topwall2Material = new StandardMaterial("topwall2Material", scene);
      topwall2Material.diffuseColor = new Color3(1, 1, 0); // Yellow
      topwall2Material.alpha = 0.2;
      topwall2Material.alphaMode = 2;
      topwall2.material = topwall2Material; 
      topwall2Ref.current = topwall2;
    }
    // Add the ball, paddles, and ground to the group
    
  

    startBallMovement(scene, ball, paddle1, paddle2, topwall1, topwall2); // Pass the paddles


    // Set the group to a specific position, e.g., at (x: 5, y: 0, z: -10)group.position.set(0, 0, 3);

    return scene;
  };

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default BabylonScene;
