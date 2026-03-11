"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ScrapViewerProps {
  material?: string;
}

export default function ScrapViewer({ material = "Metal" }: ScrapViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = mountRef.current.clientWidth;
    const height = 400; // Fixed height

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6); // gray-100

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Geometry - Irregular Polygon to represent Scrap Sheet
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(4, 0.5);
    shape.lineTo(4.5, 3);
    shape.lineTo(2, 3.5);
    shape.lineTo(-1, 2);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.1, // Thickness
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Material
    const isSteel = material.toLowerCase().includes('steel');
    const isCopper = material.toLowerCase().includes('copper');
    const isBrass = material.toLowerCase().includes('brass');

    let color = 0x888888; // Default gray (Aluminum/Steel)
    if (isCopper) color = 0xb87333;
    if (isBrass) color = 0xb5a642;

    const mat = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.8,
      roughness: 0.4
    });

    const mesh = new THREE.Mesh(geometry, mat);
    scene.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [material]);

  return (
    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-800 text-white text-sm font-bold flex justify-between">
        <span>AI Generated Scrap Visualization</span>
        <span className="text-gray-400 font-normal">Interactive 3D</span>
      </div>
      <div ref={mountRef} className="w-full h-[400px]"></div>
    </div>
  );
}
