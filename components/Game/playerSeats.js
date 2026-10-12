// Shared by the scene and host so visual seats and permissions agree.
export const FLOOR_Y = -2.8;
export const PLAYER_SCALE = 1.44;
export const PLAYER_HEIGHT = 3.5 * PLAYER_SCALE;
export const TABLE_SEATS = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4;
    return {
        id: `table-${index}`,
        position: [Math.sin(angle) * 5.6, FLOOR_Y, Math.cos(angle) * 4.2],
        rotation: angle + Math.PI,
        chairRotation: angle,
        height: 1.58,
    };
});
export const DEALER_SEAT = TABLE_SEATS[4];
export const PLAYER_SEATS = [0, 1, 7, 2, 6, 3, 5].map((i) => TABLE_SEATS[i]);
export const BAR_LENGTH = 9.12;
export const BAR_SEATS = Array.from({ length: 4 }, (_, index) => ({
    id: `bar-${index}`,
    position: [-14 + ((index + 0.5) * BAR_LENGTH) / 4, FLOOR_Y, -7.75],
    rotation: Math.PI,
    height: 2.18,
}));

const BAR_PLAYER_RADIUS = 0.35 * PLAYER_SCALE;
// Footprints in RoomBar's local coordinates (world origin x/z = -14).
// Keep the bartender aisle between shelving and counter open. These bounds
// describe the existing meshes; they do not move or resize any furniture.
const BAR_COLLIDERS = [
    // Countertop, including its overhang.
    { minX: -0.08, maxX: BAR_LENGTH + 0.08, minZ: 3.725, maxZ: 5.375 },
    // Back shelving and the two wine racks.
    { minX: 0.04, maxX: BAR_LENGTH, minZ: 0.055, maxZ: 1.21 },
    // Brass foot rail on the customer side.
    { minX: 0.225, maxX: BAR_LENGTH - 0.225, minZ: 5.365, maxZ: 5.475 },
];

function collidesWithBar(x, z) {
    const localX = x + 14;
    const localZ = z + 14;
    return BAR_COLLIDERS.some(({ minX, maxX, minZ, maxZ }) => {
        const closestX = Math.max(minX, Math.min(maxX, localX));
        const closestZ = Math.max(minZ, Math.min(maxZ, localZ));
        return (
            (localX - closestX) ** 2 + (localZ - closestZ) ** 2 <
            BAR_PLAYER_RADIUS ** 2
        );
    });
}

export const ALL_SEATS = [...TABLE_SEATS, ...BAR_SEATS];
export const findSeat = (id) => ALL_SEATS.find((seat) => seat.id === id);
export const seatPose = (seat) => ({
    position: [...seat.position],
    rotation: seat.rotation,
    seated: seat.id,
    animation: "sit",
});
export const seatExit = (seat) => [
    seat.position[0] - Math.sin(seat.rotation) * 1.65,
    FLOOR_Y,
    seat.position[2] - Math.cos(seat.rotation) * 1.65,
];
export function canWalkAt(x, z) {
    if (Math.abs(x) > 13.3 || Math.abs(z) > 13.3) return false;
    if ((x / 4.8) ** 2 + (z / 3.4) ** 2 < 1) return false;
    if (collidesWithBar(x, z)) return false;
    if (x > 10.5 && z < 2) return false;
    return !ALL_SEATS.some((seat) => {
        const radius = BAR_SEATS.includes(seat)
            ? 0.56 + BAR_PLAYER_RADIUS
            : 0.85;
        return Math.hypot(x - seat.position[0], z - seat.position[2]) < radius;
    });
}
