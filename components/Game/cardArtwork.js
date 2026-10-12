import { CARD_BACK_LOGO_BOUNDS, CARD_BACK_LOGO_URL } from "./cardBackLogo";

export const CARD_WIDTH = 512;
export const CARD_HEIGHT = 768;
export const CARD_RANKS = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
export const CARD_SUITS = ["♥", "♦", "♣", "♠"];

const PIP_LAYOUTS = {
    2: [
        [0.5, 0.33],
        [0.5, 0.67],
    ],
    3: [
        [0.5, 0.33],
        [0.5, 0.5],
        [0.5, 0.67],
    ],
    4: [
        [0.32, 0.33],
        [0.68, 0.33],
        [0.32, 0.67],
        [0.68, 0.67],
    ],
    5: [
        [0.32, 0.33],
        [0.68, 0.33],
        [0.5, 0.5],
        [0.32, 0.67],
        [0.68, 0.67],
    ],
    6: [
        [0.32, 0.33],
        [0.68, 0.33],
        [0.32, 0.5],
        [0.68, 0.5],
        [0.32, 0.67],
        [0.68, 0.67],
    ],
    7: [
        [0.32, 0.33],
        [0.68, 0.33],
        [0.5, 0.415],
        [0.32, 0.5],
        [0.68, 0.5],
        [0.32, 0.67],
        [0.68, 0.67],
    ],
    8: [
        [0.32, 0.33],
        [0.68, 0.33],
        [0.5, 0.415],
        [0.32, 0.5],
        [0.68, 0.5],
        [0.5, 0.585],
        [0.32, 0.67],
        [0.68, 0.67],
    ],
    9: [
        [0.32, 0.29],
        [0.68, 0.29],
        [0.32, 0.43],
        [0.68, 0.43],
        [0.5, 0.5],
        [0.32, 0.57],
        [0.68, 0.57],
        [0.32, 0.71],
        [0.68, 0.71],
    ],
    10: [
        [0.32, 0.29],
        [0.68, 0.29],
        [0.5, 0.36],
        [0.32, 0.43],
        [0.68, 0.43],
        [0.32, 0.57],
        [0.68, 0.57],
        [0.5, 0.64],
        [0.32, 0.71],
        [0.68, 0.71],
    ],
};

const SUIT_PATHS = {
    "♥": "M50 92C35 76 6 55 6 30C6 5 38-2 50 23C62-2 94 5 94 30C94 55 65 76 50 92Z",
    "♦": "M50 5L92 50L50 95L8 50Z",
    "♣": "M50 6C24 6 25 36 33 42C8 30 0 58 18 69C30 76 39 65 44 60C43 77 38 86 30 94H70C62 86 57 77 56 60C61 65 70 76 82 69C100 58 92 30 67 42C75 36 76 6 50 6Z",
    "♠": "M50 4C37 25 6 37 6 58C6 78 33 86 44 67C44 81 39 89 31 96H69C61 89 56 81 56 67C67 86 94 78 94 58C94 37 63 25 50 4Z",
};

const DEFAULT_APPEARANCE = {
    background: "#fffaf0",
    border: "#d8cfbd",
    ink: "#19202b",
    red: "#c52f40",
    blackOutline: "#a17b38",
    redOutline: "#781b2b",
    courtBackground: "#fbecd5",
    gold: "#c8a668",
};

const XML_ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
};
function escapeXml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (character) => XML_ENTITIES[character],
    );
}

// Resolve the same palette values that the 2D MUI card's sx props use.
export function getCardAppearance(theme) {
    const palette = theme?.palette;
    const dark = palette?.mode === "dark";
    return {
        ...DEFAULT_APPEARANCE,
        background:
            palette?.game?.card ??
            palette?.background?.paper ??
            DEFAULT_APPEARANCE.background,
        border: palette?.divider ?? DEFAULT_APPEARANCE.border,
        ink: palette?.text?.primary ?? DEFAULT_APPEARANCE.ink,
        blackOutline: dark ? "#d9b86d" : DEFAULT_APPEARANCE.blackOutline,
        redOutline: dark ? "#ffc1c5" : DEFAULT_APPEARANCE.redOutline,
        courtBackground: dark ? "#3a3125" : DEFAULT_APPEARANCE.courtBackground,
    };
}

function suitSvg(
    suit,
    x,
    y,
    width,
    height,
    color,
    outline,
    rotate = false,
    strokeWidth = 4,
) {
    const path = SUIT_PATHS[suit];
    if (!path) return "";
    return `<g transform="translate(${x} ${y})${rotate ? " rotate(180)" : ""}"><g transform="translate(${-width / 2} ${-height / 2}) scale(${width / 100} ${height / 100})"><path d="${path}" fill="${escapeXml(color)}" stroke="${outline ? escapeXml(outline) : "none"}" stroke-width="${escapeXml(strokeWidth)}" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></g></g>`;
}

function rankSvg(number, x, y, size, color) {
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="700" fill="${escapeXml(color)}">${escapeXml(number)}</text>`;
}

// All markup is generated here; 2D and 3D consume this same SVG artwork.
export function createCardSvgContent(
    number,
    suit,
    appearance = DEFAULT_APPEARANCE,
    idPrefix = "card",
    logoSvg,
    { centerStrokeWidth = 4 } = {},
) {
    const style = { ...DEFAULT_APPEARANCE, ...appearance };
    const frame = `<rect width="512" height="768" fill="${escapeXml(style.background)}"/><rect x="8" y="8" width="496" height="752" rx="24" fill="none" stroke="${escapeXml(style.border)}" stroke-width="4"/>`;

    if (!number) {
        const patternId = `${escapeXml(idPrefix)}-weave`;
        const { x, y, width, height } = CARD_BACK_LOGO_BOUNDS;
        const logo =
            logoSvg ??
            `<image href="${CARD_BACK_LOGO_URL}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
        return `${frame}<defs><pattern id="${patternId}" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 0L32 32M32 0L0 32" stroke="#7292bd" stroke-width="2"/></pattern></defs><rect x="24" y="24" width="464" height="720" rx="18" fill="#234b83"/><rect x="32" y="32" width="448" height="704" rx="16" fill="url(#${patternId})"/><rect x="40" y="40" width="432" height="688" rx="12" fill="none" stroke="#dbc48c" stroke-width="4"/><path d="M256 248L368 384L256 520L144 384Z" fill="#193965" stroke="#dbc48c" stroke-width="4"/>${logo}`;
    }

    const red = suit === "♥" || suit === "♦";
    const color = red ? style.red : style.ink;
    const outline = red ? style.redOutline : style.blackOutline;
    const corner =
        rankSvg(number, 64, 82, String(number) === "10" ? 82 : 98, color) +
        suitSvg(suit, 64, 178, 48, 48, color);
    let center;
    const pips = PIP_LAYOUTS[number];
    if (pips) {
        center = pips
            .map(([x, y]) =>
                suitSvg(
                    suit,
                    x * CARD_WIDTH,
                    y * CARD_HEIGHT,
                    86,
                    pips.length >= 9 ? 94 : 112,
                    color,
                    outline,
                    y > 0.5,
                    centerStrokeWidth,
                ),
            )
            .join("");
    } else if (number === "A") {
        center = suitSvg(
            suit,
            256,
            384,
            260,
            260,
            color,
            outline,
            false,
            centerStrokeWidth,
        );
    } else {
        center = `<path d="M256 202L404 384L256 626L108 384Z" fill="${escapeXml(style.courtBackground)}" stroke="${escapeXml(style.gold)}" stroke-width="5"/>${rankSvg(number, 256, 360, 210, color)}${suitSvg(suit, 256, 560, 124, 124, color, outline, false, centerStrokeWidth)}`;
    }
    return `${frame}${corner}<g transform="translate(512 768) rotate(180)">${corner}</g>${center}`;
}

export function createCardSvg(number, suit, appearance, logoSvg) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">${createCardSvgContent(number, suit, appearance, "texture", logoSvg)}</svg>`;
}
