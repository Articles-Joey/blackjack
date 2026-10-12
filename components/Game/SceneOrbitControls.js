"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function SceneOrbitControls({ reducedMotion }) {
    const controls = useRef(null);
    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    const size = useThree((state) => state.size);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        const orbit = new OrbitControls(camera, gl.domElement);
        orbit.target.set(0, -0.7, 0);
        // orbit.enablePan = false;
        orbit.enablePan = true;
        orbit.minDistance = 5.2;
        orbit.maxDistance = 12.8;
        orbit.minPolarAngle = 0.72;
        orbit.maxPolarAngle = 1.35;
        orbit.rotateSpeed = 0.65;
        orbit.enableRotate = true;
        orbit.zoomSpeed = 0.8;
        orbit.dampingFactor = 0.08;
        const onChange = () => invalidate();
        orbit.addEventListener("change", onChange);
        orbit.update();
        controls.current = orbit;
        invalidate();
        return () => {
            orbit.removeEventListener("change", onChange);
            orbit.dispose();
            controls.current = null;
        };
    }, [camera, gl, invalidate]);

    useEffect(() => {
        if (controls.current) controls.current.enableDamping = !reducedMotion;
        invalidate();
    }, [reducedMotion, invalidate]);

    useEffect(() => {
        // Resize the lens without resetting the user's orbit position.
        const aspect = Math.max(size.width, 1) / Math.max(size.height, 1);
        camera.fov = aspect < 1 ? Math.min(84, 60 + (1 - aspect) * 38) : 48;
        camera.updateProjectionMatrix();
        invalidate();
    }, [camera, size.width, size.height, invalidate]);

    useFrame((state, delta) => {
        if (controls.current?.enableDamping) controls.current.update(delta);
    }, -1);

    return null;
}
