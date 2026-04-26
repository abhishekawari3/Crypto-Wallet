import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NexaScene({ compact = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.45, compact ? 5.2 : 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.25,
      roughness: 0.58,
    });
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.38,
      roughness: 0.36,
    });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 });

    const wallet = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.45, 0.22), panelMaterial);
    wallet.rotation.y = -0.18;
    group.add(wallet);

    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.28), edgeMaterial);
    latch.position.set(0.72, 0, 0.22);
    latch.rotation.y = -0.18;
    group.add(latch);

    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.03), edgeMaterial);
    chip.position.set(-0.58, 0.1, 0.15);
    chip.rotation.y = -0.18;
    group.add(chip);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.012, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.42 })
    );
    orbit.rotation.x = 1.15;
    orbit.rotation.y = 0.32;
    group.add(orbit);

    const points = [];
    for (let i = 0; i < 60; i += 1) {
      const angle = (i / 60) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * 1.95, Math.sin(angle) * 0.5, Math.sin(angle) * 0.5));
    }
    const signal = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
    signal.rotation.x = -0.5;
    group.add(signal);

    const key = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), edgeMaterial);
    key.position.set(-1.55, 0.78, 0.1);
    group.add(key);

    scene.add(new THREE.AmbientLight(0xffffff, 1.3));

    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(2.5, 3.5, 4);
    scene.add(light);

    const fill = new THREE.PointLight(0xf59e0b, 11, 7);
    fill.position.set(-2.4, -1.4, 2);
    scene.add(fill);

    const resize = () => {
      const width = mount.clientWidth || 320;
      const height = mount.clientHeight || 260;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frameId;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      group.rotation.y += 0.006;
      orbit.rotation.z += 0.01;
      signal.rotation.z -= 0.005;
      key.position.y = 0.78 + Math.sin(Date.now() * 0.002) * 0.08;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [compact]);

  return <div ref={mountRef} className={compact ? "h-56 w-full sm:h-72" : "h-72 w-full sm:h-96"} aria-hidden="true" />;
}
