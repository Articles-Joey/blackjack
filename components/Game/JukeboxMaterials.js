"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

function canvasContext(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context)
        throw new Error("Jukebox textures require a 2D canvas context.");
    return { canvas, context };
}

function colorTexture(canvas, anisotropy) {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
}

function createJukeboxTextures(anisotropy) {
    const wood = canvasContext(512, 512);
    const pixels = wood.context.createImageData(512, 512);
    let seed = 19471;
    for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const bend =
                Math.sin((y * Math.PI * 2) / 512) * 0.18 +
                Math.sin((y * Math.PI * 4) / 512) * 0.07;
            const grain = (x * Math.PI * 2) / 512 + bend;
            const shade =
                Math.sin(grain * 7) * 9 +
                Math.sin(grain * 23) * 4 -
                Math.pow((Math.sin(grain * 67) + 1) / 2, 10) * 13 +
                (seed / 4294967296 - 0.5) * 5;
            const offset = (y * 512 + x) * 4;
            pixels.data[offset] = 161 + shade;
            pixels.data[offset + 1] = 84 + shade * 0.7;
            pixels.data[offset + 2] = 42 + shade * 0.45;
            pixels.data[offset + 3] = 255;
        }
    }
    wood.context.putImageData(pixels, 0, 0);
    const woodTexture = colorTexture(wood.canvas, anisotropy);
    woodTexture.wrapS = woodTexture.wrapT = RepeatWrapping;
    woodTexture.repeat.set(0.85, 0.55);

    const cloth = canvasContext(128, 128);
    cloth.context.fillStyle = "#332d21";
    cloth.context.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 4) {
        for (let x = 0; x < 128; x += 4) {
            cloth.context.fillStyle = (x + y) % 8 ? "#67573a" : "#89754c";
            cloth.context.fillRect(x, y, 2, 2);
        }
    }
    const clothTexture = colorTexture(cloth.canvas, anisotropy);
    clothTexture.wrapS = clothTexture.wrapT = RepeatWrapping;
    clothTexture.repeat.set(3, 5);

    const archLabel = canvasContext(512, 256);
    const name = "AIRROCKET";
    archLabel.context.fillStyle = "#ead7a1";
    archLabel.context.font = "bold 34px Georgia, serif";
    archLabel.context.textAlign = "center";
    archLabel.context.textBaseline = "middle";
    [...name].forEach((letter, index) => {
        const angle = (index - (name.length - 1) / 2) * 0.15;
        archLabel.context.save();
        archLabel.context.translate(
            256 + Math.sin(angle) * 255,
            236 - Math.cos(angle) * 175,
        );
        archLabel.context.rotate(angle);
        archLabel.context.fillText(letter, 0, 0);
        archLabel.context.restore();
    });

    const badge = canvasContext(512, 96);
    badge.context.fillStyle = "#272b2c";
    badge.context.fillRect(0, 0, 512, 96);
    badge.context.strokeStyle = "#d9d7ce";
    badge.context.lineWidth = 5;
    badge.context.strokeRect(5, 5, 502, 86);
    badge.context.font = "bold italic 52px Georgia, serif";
    badge.context.textAlign = "center";
    badge.context.textBaseline = "middle";
    badge.context.fillStyle = "#f4eee0";
    badge.context.fillText("AIRROCKET", 256, 51);

    return {
        wood: woodTexture,
        cloth: clothTexture,
        archLabel: colorTexture(archLabel.canvas, anisotropy),
        badge: colorTexture(badge.canvas, anisotropy),
    };
}

export default function useJukeboxMaterials() {
    const [textures, setTextures] = useState({
        wood: null,
        cloth: null,
        archLabel: null,
        badge: null,
    });
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        const next = createJukeboxTextures(
            Math.min(8, gl.capabilities.getMaxAnisotropy()),
        );
        setTextures(next);
        return () =>
            Object.values(next).forEach((texture) => texture.dispose());
    }, [gl]);

    useEffect(() => {
        invalidate();
    }, [textures, invalidate]);
    return textures;
}
