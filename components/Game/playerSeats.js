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

export const ALL_SEATS = [...TABLE_SEATS, ...BAR_SEATS];
export const findSeat = (id) => ALL_SEATS.find((seat) => seat.id === id);
export const seatPose = (seat) => ({
    position: [...seat.position],
    rotation: seat.rotation,
    seated: seat.id,
    animation: "sit",
    grounded: true,
});
export const seatExit = (seat) => [
    seat.position[0] - Math.sin(seat.rotation) * 1.65,
    FLOOR_Y,
    seat.position[2] - Math.cos(seat.rotation) * 1.65,
];
