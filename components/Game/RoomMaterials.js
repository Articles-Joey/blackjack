"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
    CanvasTexture,
    RepeatWrapping,
    SRGBColorSpace,
    TextureLoader,
} from "three";

function surfaceTexture(kind, anisotropy) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context)
        throw new Error("Room materials require a 2D canvas context.");
    const pixels = context.createImageData(256, 256);
    let seed = 104729;
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const noise = (seed / 4294967296 - 0.5) * 20;
            const grain = Math.sin(x * 0.24 + Math.sin(y * 0.025) * 2.4) * 12;
            const value = kind === "wood" ? grain + noise * 0.3 : noise;
            const base = kind === "wood" ? [104, 65, 36] : [36, 57, 45];
            const index = (y * 256 + x) * 4;
            pixels.data[index] = base[0] + value;
            pixels.data[index + 1] = base[1] + value * 0.8;
            pixels.data[index + 2] = base[2] + value * 0.6;
            pixels.data[index + 3] = 255;
        }
    }
    context.putImageData(pixels, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(kind === "wood" ? 2 : 22, kind === "wood" ? 1 : 22);
    texture.anisotropy = anisotropy;
    return texture;
}

function chairWoodTexture(anisotropy) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context)
        throw new Error("Chair materials require a 2D canvas context.");
    const pixels = context.createImageData(512, 512);
    let seed = 65537;
    for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const bend =
                Math.sin((y * Math.PI * 2) / 512) * 3 +
                Math.sin((y * Math.PI * 4) / 512) * 1.2;
            const across = ((x + bend) * Math.PI * 2) / 512;
            const broadGrain =
                Math.sin(across * 5) * 5 + Math.sin(across * 13 + 0.7) * 3;
            const fineGrain =
                Math.pow((Math.sin(across * 61) + 1) / 2, 12) * -8;
            const value =
                broadGrain + fineGrain + (seed / 4294967296 - 0.5) * 2;
            const index = (y * 512 + x) * 4;
            pixels.data[index] = 146 + value;
            pixels.data[index + 1] = 101 + value * 0.8;
            pixels.data[index + 2] = 65 + value * 0.55;
            pixels.data[index + 3] = 255;
        }
    }
    context.putImageData(pixels, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.anisotropy = anisotropy;
    return texture;
}

function cushionFeltTextures(anisotropy) {
    const colorCanvas = document.createElement("canvas");
    const bumpCanvas = document.createElement("canvas");
    colorCanvas.width =
        colorCanvas.height =
        bumpCanvas.width =
        bumpCanvas.height =
            256;
    const colorContext = colorCanvas.getContext("2d");
    const bumpContext = bumpCanvas.getContext("2d");
    if (!colorContext || !bumpContext)
        throw new Error("Cushion felt requires a 2D canvas context.");
    const colors = colorContext.createImageData(256, 256);
    const heights = bumpContext.createImageData(256, 256);
    let seed = 17389;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
            const noise = random() - 0.5;
            const nap =
                Math.sin(
                    (x * Math.PI * 8) / 256 + Math.sin((y * Math.PI * 4) / 256),
                ) * 2;
            const shade = noise * 14 + nap;
            const offset = (y * 256 + x) * 4;
            colors.data[offset] = 112 + shade;
            colors.data[offset + 1] = 59 + shade * 0.65;
            colors.data[offset + 2] = 54 + shade * 0.55;
            colors.data[offset + 3] = 255;
            const height = 128 + noise * 64 + nap * 2;
            heights.data[offset] =
                heights.data[offset + 1] =
                heights.data[offset + 2] =
                    height;
            heights.data[offset + 3] = 255;
        }
    }
    colorContext.putImageData(colors, 0, 0);
    bumpContext.putImageData(heights, 0, 0);
    // Short fibers in varied directions give felt its soft, non-woven surface.
    for (let index = 0; index < 2200; index++) {
        const x = random() * 256;
        const y = random() * 256;
        const angle = random() * Math.PI * 2;
        const length = 2 + random() * 4;
        const shade = (random() - 0.5) * 24;
        colorContext.strokeStyle = `rgba(${112 + shade}, ${59 + shade * 0.65}, ${54 + shade * 0.55}, 0.45)`;
        bumpContext.strokeStyle = `rgba( ${128 + shade * 3}, ${128 + shade * 3}, ${128 + shade * 3}, 0.65)`;
        [colorContext, bumpContext].forEach((context) => {
            context.lineWidth = 0.7;
            context.lineCap = "round";
            // Paint across tile boundaries to keep the repeating fibers continuous.
            [-256, 0, 256].forEach((shiftX) =>
                [-256, 0, 256].forEach((shiftY) => {
                    context.beginPath();
                    context.moveTo(x + shiftX, y + shiftY);
                    context.lineTo(
                        x + shiftX + Math.cos(angle) * length,
                        y + shiftY + Math.sin(angle) * length,
                    );
                    context.stroke();
                }),
            );
        });
    }
    const color = new CanvasTexture(colorCanvas);
    const bump = new CanvasTexture(bumpCanvas);
    color.colorSpace = SRGBColorSpace;
    // Bump heights remain linear data rather than color values.
    [color, bump].forEach((texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.anisotropy = anisotropy;
    });
    return { color, bump };
}

export function useRoomTextures(wallWidth, wallpaperHeight) {
    const [textures, setTextures] = useState({
        wood: null,
        chairWood: null,
        chairCrossWood: null,
        cushionFelt: null,
        cushionFeltBump: null,
        carpet: null,
        wallpaper: null,
    });
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        let active = true;
        const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        const wood = surfaceTexture("wood", anisotropy);
        const chairWood = chairWoodTexture(anisotropy);
        const chairCrossWood = chairWood.clone();
        chairCrossWood.center.set(0.5, 0.5);
        chairCrossWood.rotation = Math.PI / 2;
        chairCrossWood.needsUpdate = true;
        const carpet = surfaceTexture("carpet", anisotropy);
        const { color: cushionFelt, bump: cushionFeltBump } =
            cushionFeltTextures(anisotropy);
        setTextures({
            wood,
            chairWood,
            chairCrossWood,
            cushionFelt,
            cushionFeltBump,
            carpet,
            wallpaper: null,
        });

        const wallpaper = new TextureLoader().load(
            "/img/europeana-AV-WsvMvZQw-unsplash.jpg",
            (loaded) => {
                if (!active) return;
                loaded.colorSpace = SRGBColorSpace;
                loaded.wrapS = loaded.wrapT = RepeatWrapping;
                const tileWidth = 2.6;
                const tileHeight =
                    (tileWidth * loaded.image.height) / loaded.image.width;
                loaded.repeat.set(
                    wallWidth / tileWidth,
                    wallpaperHeight / tileHeight,
                );
                loaded.anisotropy = anisotropy;
                loaded.needsUpdate = true;
                setTextures({
                    wood,
                    chairWood,
                    chairCrossWood,
                    cushionFelt,
                    cushionFeltBump,
                    carpet,
                    wallpaper: loaded,
                });
                invalidate();
            },
            undefined,
            () => invalidate(),
        );

        return () => {
            active = false;
            wood.dispose();
            chairWood.dispose();
            chairCrossWood.dispose();
            cushionFelt.dispose();
            cushionFeltBump.dispose();
            carpet.dispose();
            wallpaper.dispose();
        };
    }, [gl, wallWidth, wallpaperHeight, invalidate]);

    useEffect(() => {
        invalidate();
    }, [textures, invalidate]);

    return textures;
}
