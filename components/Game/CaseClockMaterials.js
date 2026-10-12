"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

function canvasSurface(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context)
        throw new Error("Clock materials require a 2D canvas context.");
    return { canvas, context };
}

function textureFrom(canvas, anisotropy) {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
}

function drawFlower(context, x, y, radius) {
    context.fillStyle = "#99694b";
    for (let petal = 0; petal < 6; petal++) {
        const angle = (petal * Math.PI) / 3;
        context.beginPath();
        context.ellipse(
            x + Math.cos(angle) * radius * 0.58,
            y + Math.sin(angle) * radius * 0.58,
            radius * 0.48,
            radius * 0.36,
            angle,
            0,
            Math.PI * 2,
        );
        context.fill();
    }
    context.fillStyle = "#c9a75e";
    context.beginPath();
    context.arc(x, y, radius * 0.28, 0, Math.PI * 2);
    context.fill();
}

function drawScroll(context, x, y, rotation) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.strokeStyle = "#ad884b";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(12, -34, 47, -30, 43, -7);
    context.bezierCurveTo(40, 12, 18, 9, 25, -4);
    context.bezierCurveTo(31, -13, 42, 1, 54, -6);
    context.stroke();
    context.restore();
}

function createClockTextures(anisotropy) {
    let seed = 85703;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const wood = canvasSurface(512, 512);
    const woodPixels = wood.context.createImageData(512, 512);
    for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
            const phaseX = (x * Math.PI * 2) / 512;
            const phaseY = (y * Math.PI * 2) / 512;
            const warp =
                Math.sin(phaseY * 3) * 0.4 + Math.sin(phaseY * 7) * 0.09;
            const burl = Math.sin(phaseX * 8 + Math.sin(phaseY * 4) * 3) * 9;
            const fiber = Math.sin((phaseX + warp) * 29) * 4;
            const shade = burl + fiber + (random() - 0.5) * 15;
            const offset = (y * 512 + x) * 4;
            woodPixels.data[offset] = 123 + shade;
            woodPixels.data[offset + 1] = 63 + shade * 0.65;
            woodPixels.data[offset + 2] = 32 + shade * 0.4;
            woodPixels.data[offset + 3] = 255;
        }
    }
    wood.context.putImageData(woodPixels, 0, 0);
    const woodTexture = textureFrom(wood.canvas, anisotropy);
    woodTexture.wrapS = woodTexture.wrapT = RepeatWrapping;
    woodTexture.repeat.set(1.1, 0.65);

    const dial = canvasSurface(512, 720);
    const paper = dial.context.createImageData(512, 720);
    for (let index = 0; index < paper.data.length; index += 4) {
        const shade = (random() - 0.5) * 12;
        paper.data[index] = 220 + shade;
        paper.data[index + 1] = 197 + shade;
        paper.data[index + 2] = 146 + shade;
        paper.data[index + 3] = 255;
    }
    const context = dial.context;
    context.putImageData(paper, 0, 0);
    const vignette = context.createRadialGradient(256, 440, 120, 256, 440, 420);
    vignette.addColorStop(0, "rgba(110, 65, 24, 0)");
    vignette.addColorStop(1, "rgba(110, 65, 24, 0.23)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, 512, 720);

    const centerX = 256;
    const centerY = 458;
    context.strokeStyle = "#9d814c";
    context.lineWidth = 1.5;
    [198, 207].forEach((radius) => {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
    });
    for (let tick = 0; tick < 60; tick++) {
        const angle = (tick * Math.PI) / 30;
        const inner = tick % 5 ? 192 : 185;
        context.strokeStyle = "#766340";
        context.lineWidth = tick % 5 ? 1 : 2;
        context.beginPath();
        context.moveTo(
            centerX + Math.sin(angle) * inner,
            centerY - Math.cos(angle) * inner,
        );
        context.lineTo(
            centerX + Math.sin(angle) * 198,
            centerY - Math.cos(angle) * 198,
        );
        context.stroke();
    }
    context.fillStyle = "#403a28";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "46px Georgia, Times New Roman, serif";
    for (let hour = 1; hour <= 12; hour++) {
        const angle = (hour * Math.PI) / 6;
        context.fillText(
            String(hour),
            centerX + Math.sin(angle) * 160,
            centerY - Math.cos(angle) * 160,
        );
    }

    // Small seconds dial and floral arch ornament echo the antique painted dial.
    context.strokeStyle = "#ac925b";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(256, 363, 36, 0, Math.PI * 2);
    context.stroke();
    for (let tick = 0; tick < 12; tick++) {
        const angle = (tick * Math.PI) / 6;
        context.beginPath();
        context.moveTo(256 + Math.sin(angle) * 30, 363 - Math.cos(angle) * 30);
        context.lineTo(256 + Math.sin(angle) * 34, 363 - Math.cos(angle) * 34);
        context.stroke();
    }
    context.strokeStyle = "#665437";
    context.beginPath();
    context.moveTo(236, 363);
    context.lineTo(280, 357);
    context.stroke();

    [
        [94, 285, 0],
        [418, 285, Math.PI],
        [94, 650, -Math.PI / 2],
        [418, 650, Math.PI / 2],
        [204, 146, 0],
        [308, 146, Math.PI],
    ].forEach(([x, y, angle]) => drawScroll(context, x, y, angle));
    drawFlower(context, 172, 130, 22);
    drawFlower(context, 340, 130, 22);
    drawFlower(context, 256, 91, 16);
    context.fillStyle = "#a57b48";
    context.beginPath();
    context.moveTo(235, 131);
    context.lineTo(277, 131);
    context.bezierCurveTo(278, 173, 234, 173, 235, 131);
    context.fill();
    context.fillRect(245, 166, 22, 5);

    return { wood: woodTexture, dial: textureFrom(dial.canvas, anisotropy) };
}

export default function useCaseClockMaterials() {
    const [textures, setTextures] = useState({ wood: null, dial: null });
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);
    useEffect(() => {
        const next = createClockTextures(
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
