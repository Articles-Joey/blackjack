export const CARD_BACK_LOGO_URL = "/img/logo-white.svg";
export const CARD_BACK_LOGO_BOUNDS = {
    x: 184,
    y: 312,
    width: 144,
    height: 144,
};

let logoPromise = null;

// Embed the source SVG before rasterizing: SVG images cannot depend on external image resources.
export function loadCardBackLogoSvg() {
    if (!logoPromise) {
        logoPromise = fetch(CARD_BACK_LOGO_URL)
            .then((response) => {
                if (!response.ok)
                    throw new Error("Unable to load the card-back logo.");
                return response.text();
            })
            .then((source) => {
                const svgDocument = new DOMParser().parseFromString(
                    source,
                    "image/svg+xml",
                );
                const logo = svgDocument.documentElement;
                if (
                    logo.localName !== "svg" ||
                    svgDocument.querySelector("parsererror")
                ) {
                    throw new Error("The card-back logo must be a valid SVG.");
                }
                for (const [key, value] of Object.entries(
                    CARD_BACK_LOGO_BOUNDS,
                )) {
                    logo.setAttribute(key, String(value));
                }
                logo.setAttribute("preserveAspectRatio", "xMidYMid meet");
                return new XMLSerializer().serializeToString(logo);
            })
            .catch((error) => {
                logoPromise = null;
                throw error;
            });
    }
    return logoPromise;
}
