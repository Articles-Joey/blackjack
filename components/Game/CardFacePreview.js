"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { MOUSE, TOUCH } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import PlayingCard from "./PlayingCard";
import { CARD_RANKS, CARD_SUITS } from "./cardArtwork";
const GRID_WIDTH = 13.2;
const GRID_HEIGHT = 6.1;

function fitPreview(camera, controls, size) {
    const width = Math.max(size.width, 1);
    const height = Math.max(size.height, 1);
    const left = width >= 992 ? 316 : 16;
    const top = width >= 992 ? 24 : 200;
    const right = 24;
    const bottom = 24;
    const zoom = Math.max(
        1,
        Math.min(
            Math.max(width - left - right, 1) / GRID_WIDTH,
            Math.max(height - top - bottom, 1) / GRID_HEIGHT,
        ) * 0.94,
    );

    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.zoom = zoom;
    const x = -(left - right) / (2 * zoom);
    const z = -(top - bottom) / (2 * zoom);
    camera.position.set(x, 14, z);
    camera.up.set(0, 0, -1);
    controls.target.set(x, 0, z);
    controls.minZoom = zoom * 0.75;
    controls.maxZoom = zoom * 8;
    camera.lookAt(controls.target);
    camera.updateProjectionMatrix();
    controls.update();
}

export default function CardFacePreview({ cardAppearance }) {
    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    const size = useThree((state) => state.size);
    const invalidate = useThree((state) => state.invalidate);
    const get = useThree((state) => state.get);
    const controls = useRef(null);

    useEffect(() => {
        // The preview has its own camera and never changes the live hand.
        camera.manual = true;
        camera.up.set(0, 0, -1);
        const orbit = new OrbitControls(camera, gl.domElement);
        orbit.enableRotate = false;
        orbit.enableDamping = false;
        orbit.screenSpacePanning = true;
        orbit.mouseButtons.LEFT = MOUSE.PAN;
        orbit.touches.ONE = TOUCH.PAN;
        orbit.touches.TWO = TOUCH.DOLLY_PAN;
        const onChange = () => invalidate();
        orbit.addEventListener("change", onChange);
        controls.current = orbit;
        fitPreview(camera, orbit, get().size);
        invalidate();
        return () => {
            orbit.removeEventListener("change", onChange);
            orbit.dispose();
            controls.current = null;
        };
    }, [camera, gl, get, invalidate]);

    useEffect(() => {
        if (controls.current) fitPreview(camera, controls.current, size);
        invalidate();
    }, [camera, size, invalidate]);

    return (
        <>
            <color
                attach="background"
                args={["#10251d"]}
            />
            <ambientLight intensity={1.2} />
            <directionalLight
                position={[0, 10, 3]}
                intensity={2}
            />
            <mesh
                position={[0, -0.05, 0]}
                receiveShadow
            >
                <boxGeometry args={[GRID_WIDTH, 0.1, GRID_HEIGHT]} />
                <meshStandardMaterial
                    color="#20523c"
                    roughness={1}
                />
            </mesh>
            {CARD_SUITS.flatMap((suit, row) =>
                CARD_RANKS.map((number, column) => (
                    <PlayingCard
                        key={`${number}${suit}`}
                        number={number}
                        suit={suit}
                        position={[
                            (column - 6) * 0.98,
                            0.105,
                            (row - 1.5) * 1.42,
                        ]}
                        reducedMotion
                        appearance={cardAppearance}
                    />
                )),
            )}
        </>
    );
}
