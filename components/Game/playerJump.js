import { PLAYER_SCALE } from "./playerSeats";

export const PLAYER_ANIMATIONS = {
    idle: "Idle_Loop",
    walk: "Walk_Loop",
    jumpStart: "Jump_Start",
    jumpLoop: "Jump_Loop",
    jumpLand: "Jump_Land",
};

export const JUMP_VELOCITY = 6 * PLAYER_SCALE;
export const JUMP_GRAVITY = 15 * PLAYER_SCALE;
const GROUNDED_COOLDOWN = 0.2;

export const createJumpState = () => ({
    wasGrounded: true,
    phase: null,
    phaseTime: 0,
    groundedTime: GROUNDED_COOLDOWN,
});

export const isAirborne = (pose) =>
    pose.grounded === false ||
    pose.animation === "jumpStart" ||
    pose.animation === "jumpLoop";

export function stopPlayerMotion(pose) {
    return {
        ...pose,
        animation: pose.seated ? "sit" : isAirborne(pose) ? "jumpLoop" : "idle",
        locomotion: "idle",
    };
}

// Rapier owns height, gravity and contacts. This only tracks jump animation
// phases and the grounded cooldown; launch requests become a body velocity.
export function stepJump(previous, onGround, delta, requested) {
    const jump = { ...previous };
    const dt = Math.min(Math.max(delta, 0), 0.05);
    jump.groundedTime = onGround ? jump.groundedTime + dt : 0;
    jump.phaseTime += dt;

    let launch = false;
    if (onGround && !jump.wasGrounded) {
        jump.phase = "jumpLand";
        jump.phaseTime = 0;
    } else if (!onGround && jump.wasGrounded && jump.phase !== "jumpStart") {
        jump.phase = "jumpLoop";
        jump.phaseTime = 0;
    }
    if (
        requested &&
        onGround &&
        jump.groundedTime >= GROUNDED_COOLDOWN &&
        (jump.phase === null || jump.phase === "jumpLand")
    ) {
        launch = true;
        jump.phase = "jumpStart";
        jump.phaseTime = 0;
        jump.groundedTime = 0;
    }
    jump.wasGrounded = onGround && !launch;

    // Clip-finished events normally advance these phases. Recover if a model
    // is still loading or its animation callback is unavailable.
    if (jump.phase === "jumpStart" && jump.phaseTime > 1) {
        jump.phase = "jumpLoop";
        jump.phaseTime = 0;
    } else if (jump.phase === "jumpLand" && jump.phaseTime > 1) {
        jump.phase = null;
        jump.phaseTime = 0;
    }
    return { jump, launch };
}
