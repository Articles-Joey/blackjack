import { CanvasTexture, SRGBColorSpace } from "three";
import { CARD_WIDTH, CARD_HEIGHT, createCardSvg } from "./cardArtwork";
import { loadCardBackLogoSvg } from "./cardBackLogo";

export default async function createCardTexture(number, suit, appearance) {
    const logoSvg = number ? undefined : await loadCardBackLogoSvg();
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context)
        return Promise.reject(
            new Error("Card textures require a 2D canvas context."),
        );
    const svg = createCardSvg(number, suit, appearance, logoSvg);
    const url = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            try {
                context.drawImage(image, 0, 0, CARD_WIDTH, CARD_HEIGHT);
                const texture = new CanvasTexture(canvas);
                texture.colorSpace = SRGBColorSpace;
                resolve(texture);
            } catch (error) {
                reject(error);
            } finally {
                URL.revokeObjectURL(url);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to render the SVG card face."));
        };
        image.src = url;
    });
}
