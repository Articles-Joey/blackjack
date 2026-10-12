"use client";

import { useRoomTextures } from "./RoomMaterials";
import WoodBox from "./WoodBox";
import RoomBar from "./RoomBar";
import ChairSeatCushion, { CushionMaterial } from "./ChairSeatCushion";
import WoodStove from "./WoodStove";
import FirewoodRack from "./FirewoodRack";
import Jukebox from "./Jukebox";
import FramedArt from "./FramedArt";
import CaseClock from "./CaseClock";

export const ROOM_FLOOR_Y = -2.8;
const ROOM_WIDTH = 28;
const ROOM_HEIGHT = 12;
const PANEL_HEIGHT = ROOM_HEIGHT * 0.2;
const TRIM_HEIGHT = 0.16;
const WALLPAPER_HEIGHT = ROOM_HEIGHT - PANEL_HEIGHT - TRIM_HEIGHT;
const STOVE_SCALE = 5;
const HEARTH_HEIGHT = 0.08;

function RoomWall({ position, rotation, wood, wallpaper }) {
    const panelCount = 20;
    const panelWidth = ROOM_WIDTH / panelCount;
    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            <mesh
                position={[0, ROOM_HEIGHT / 2, -0.05]}
                receiveShadow
            >
                <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.2]} />
                <meshStandardMaterial
                    color="#b7a58a"
                    roughness={0.95}
                />
            </mesh>

            <WoodBox
                position={[0, PANEL_HEIGHT / 2, 0.045]}
                size={[ROOM_WIDTH, PANEL_HEIGHT, 0.1]}
                texture={wood}
                color="#b48b63"
            />
            {Array.from({ length: panelCount }, (_, index) => (
                <group
                    key={index}
                    position={[
                        -ROOM_WIDTH / 2 + (index + 0.5) * panelWidth,
                        0,
                        0,
                    ]}
                >
                    <WoodBox
                        position={[0, PANEL_HEIGHT / 2, 0.115]}
                        size={[panelWidth - 0.2, PANEL_HEIGHT - 0.46, 0.035]}
                        texture={wood}
                        color="#caa177"
                    />
                    <WoodBox
                        position={[
                            -panelWidth / 2 + 0.045,
                            PANEL_HEIGHT / 2,
                            0.12,
                        ]}
                        size={[0.09, PANEL_HEIGHT, 0.075]}
                        texture={wood}
                    />
                </group>
            ))}
            <WoodBox
                position={[0, 0.1, 0.12]}
                size={[ROOM_WIDTH, 0.2, 0.18]}
                texture={wood}
            />
            <WoodBox
                position={[0, PANEL_HEIGHT + TRIM_HEIGHT / 2, 0.12]}
                size={[ROOM_WIDTH, TRIM_HEIGHT, 0.22]}
                texture={wood}
                color="#edcca0"
            />
            <WoodBox
                position={[0, PANEL_HEIGHT + TRIM_HEIGHT + 0.035, 0.1]}
                size={[ROOM_WIDTH, 0.07, 0.16]}
                texture={wood}
            />

            <mesh
                position={[
                    0,
                    PANEL_HEIGHT + TRIM_HEIGHT + WALLPAPER_HEIGHT / 2,
                    0.055,
                ]}
                receiveShadow
            >
                <planeGeometry args={[ROOM_WIDTH, WALLPAPER_HEIGHT]} />
                <meshStandardMaterial
                    key={wallpaper?.uuid ?? "plain"}
                    map={wallpaper}
                    color={wallpaper ? "#fff5e6" : "#b7a58a"}
                    roughness={0.95}
                />
            </mesh>
            <WoodBox
                position={[0, ROOM_HEIGHT - 0.12, 0.1]}
                size={[ROOM_WIDTH, 0.24, 0.2]}
                texture={wood}
                color="#edcca0"
            />
        </group>
    );
}

function LowPolyChair({
    position,
    rotation,
    wood,
    crossWood,
    felt,
    feltBump,
    scale = 1.25,
}) {
    const finish = {
        color: wood ? "#fff8ed" : "#92633f",
        roughness: 0.46,
        bumpScale: 0.006,
    };
    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
            scale={scale}
        >
            {[-0.46, 0.46].flatMap((x) =>
                [-0.46, 0.46].map((z) => (
                    <mesh
                        key={`${x}-${z}`}
                        position={[x, 0.52, z]}
                        castShadow
                        receiveShadow
                    >
                        <cylinderGeometry args={[0.09, 0.07, 1.04, 4]} />
                        <meshStandardMaterial
                            key={wood?.uuid ?? "plain"}
                            map={wood}
                            bumpMap={wood}
                            {...finish}
                            flatShading
                        />
                    </mesh>
                )),
            )}
            <WoodBox
                position={[0, 1.08, 0]}
                size={[1.25, 0.18, 1.25]}
                texture={wood}
                {...finish}
                castShadow
            />
            <ChairSeatCushion
                position={[0, 1.2, -0.03]}
                felt={felt}
                bump={feltBump}
            />
            {[-0.52, 0.52].map((x) => (
                <WoodBox
                    key={x}
                    position={[x, 1.8, 0.5]}
                    size={[0.12, 1.46, 0.13]}
                    renderOrder={2}
                    texture={wood}
                    {...finish}
                    castShadow
                />
            ))}
            <WoodBox
                position={[0, 2.45, 0.5]}
                size={[1.23, 0.17, 0.2]}
                renderOrder={2}
                texture={crossWood}
                {...finish}
                castShadow
            />
            <WoodBox
                position={[0, 1.72, 0.5]}
                size={[1.23, 0.12, 0.17]}
                renderOrder={2}
                texture={crossWood}
                {...finish}
                castShadow
            />
            <mesh
                position={[0, 2.0725, 0.485]}
                renderOrder={1}
                castShadow
                receiveShadow
            >
                {/* Leave clearance inside the rails; bias the cushion depth behind the wood. */}
                <boxGeometry args={[0.9, 0.56, 0.12]} />
                <CushionMaterial
                    felt={felt}
                    bump={feltBump}
                    polygonOffset
                />
            </mesh>
        </group>
    );
}

export default function GameRoom({ reducedMotion = false }) {
    const {
        wood,
        chairWood,
        chairCrossWood,
        cushionFelt,
        cushionFeltBump,
        carpet,
        wallpaper,
    } = useRoomTextures(ROOM_WIDTH, WALLPAPER_HEIGHT);
    const halfWidth = ROOM_WIDTH / 2;

    return (
        <>
            <mesh
                position={[0, ROOM_FLOOR_Y - 0.05, 0]}
                receiveShadow
            >
                <boxGeometry args={[ROOM_WIDTH, 0.1, ROOM_WIDTH]} />
                <meshStandardMaterial
                    key={carpet?.uuid ?? "plain"}
                    map={carpet}
                    bumpMap={carpet}
                    bumpScale={0.05}
                    color={carpet ? "#ffffff" : "#24392d"}
                    roughness={1}
                />
            </mesh>
            <mesh
                position={[0, ROOM_FLOOR_Y + ROOM_HEIGHT, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[ROOM_WIDTH, ROOM_WIDTH]} />
                <meshStandardMaterial
                    color="#d3c5aa"
                    roughness={1}
                />
            </mesh>

            <RoomWall
                position={[0, ROOM_FLOOR_Y, -halfWidth]}
                rotation={0}
                wood={wood}
                wallpaper={wallpaper}
            />
            <RoomWall
                position={[0, ROOM_FLOOR_Y, halfWidth]}
                rotation={Math.PI}
                wood={wood}
                wallpaper={wallpaper}
            />
            <RoomWall
                position={[-halfWidth, ROOM_FLOOR_Y, 0]}
                rotation={Math.PI / 2}
                wood={wood}
                wallpaper={wallpaper}
            />
            <RoomWall
                position={[halfWidth, ROOM_FLOOR_Y, 0]}
                rotation={-Math.PI / 2}
                wood={wood}
                wallpaper={wallpaper}
            />

            <RoomBar
                wood={wood}
                wallWidth={ROOM_WIDTH}
                floorY={ROOM_FLOOR_Y}
                reducedMotion={reducedMotion}
            />

            <FramedArt
                src="/img/A_Friend_in_Need_1903_C.M.Coolidge.webp"
                position={[
                    2.5,
                    ROOM_FLOOR_Y + PANEL_HEIGHT + TRIM_HEIGHT + 2.74,
                    -halfWidth + 0.16,
                ]}
                wood={chairWood}
            />
            <FramedArt
                src="/img/Joseph_Walter_-_The_Great_Western_riding_a_tidal_wave.webp"
                position={[
                    -halfWidth + 0.16,
                    ROOM_FLOOR_Y + PANEL_HEIGHT + TRIM_HEIGHT + 2.74,
                    -halfWidth + 11,
                ]}
                rotation={[0, Math.PI / 2, 0]}
                wood={chairWood}
            />
            <FramedArt
                src="/img/Albert_Bierstadt_-_The_Wild_West.webp"
                position={[
                    -halfWidth + 0.16,
                    ROOM_FLOOR_Y + PANEL_HEIGHT + TRIM_HEIGHT + 2.74,
                    -halfWidth + 20,
                ]}
                rotation={[0, Math.PI / 2, 0]}
                wood={chairWood}
            />

            <mesh
                position={[
                    halfWidth - 2.3,
                    ROOM_FLOOR_Y + HEARTH_HEIGHT / 2,
                    -halfWidth + 2.3,
                ]}
                receiveShadow
            >
                <boxGeometry args={[4, HEARTH_HEIGHT, 4]} />
                <meshStandardMaterial
                    color="#494642"
                    roughness={0.95}
                />
            </mesh>
            <WoodStove
                name="back-right-wood-stove"
                position={[
                    halfWidth - 2.3,
                    ROOM_FLOOR_Y + HEARTH_HEIGHT,
                    -halfWidth + 2.3,
                ]}
                rotation={[0, -Math.PI / 4, 0]}
                scale={STOVE_SCALE}
                pipeTop={(ROOM_HEIGHT - HEARTH_HEIGHT + 0.12) / STOVE_SCALE}
                smoke={false}
                reducedMotion={reducedMotion}
            />
            <FirewoodRack
                position={[halfWidth - 6.8, ROOM_FLOOR_Y, -halfWidth + 1.5]}
                rotation={[0, Math.PI / 16, 0]}
            />

            <Jukebox
                position={[halfWidth - 1.4, ROOM_FLOOR_Y, -halfWidth + 11]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={1.35}
            />
            <CaseClock
                position={[halfWidth - 1.4, ROOM_FLOOR_Y, -halfWidth + 14.3]}
                rotation={[0, -Math.PI / 2, 0]}
                reducedMotion={reducedMotion}
            />

            {Array.from({ length: 8 }, (_, index) => {
                const angle = (index * Math.PI) / 4;
                return (
                    <LowPolyChair
                        key={index}
                        position={[
                            Math.sin(angle) * 5.6,
                            ROOM_FLOOR_Y,
                            Math.cos(angle) * 4.2,
                        ]}
                        rotation={angle}
                        wood={chairWood}
                        crossWood={chairCrossWood}
                        felt={cushionFelt}
                        feltBump={cushionFeltBump}
                    />
                );
            })}

            {[-2.8, 2.8].flatMap((x) =>
                [-1.6, 1.6].map((z) => (
                    <group key={`${x}-${z}`}>
                        <mesh
                            position={[x, -1.55, z]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.2, 0.15, 2.5, 8]} />
                            <meshStandardMaterial
                                key={wood?.uuid ?? "plain"}
                                map={wood}
                                color="#c29d75"
                                roughness={0.7}
                                flatShading
                            />
                        </mesh>
                        <mesh
                            position={[x, ROOM_FLOOR_Y + 0.1, z]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.17, 0.18, 0.2, 8]} />
                            <meshStandardMaterial
                                color="#a28650"
                                metalness={0.5}
                                roughness={0.5}
                                flatShading
                            />
                        </mesh>
                    </group>
                )),
            )}
            <WoodBox
                position={[0, -1.85, 0]}
                size={[5.7, 0.16, 0.2]}
                texture={wood}
                castShadow
            />
            {[-2.8, 2.8].map((x) => (
                <WoodBox
                    key={x}
                    position={[x, -1.85, 0]}
                    size={[0.16, 0.16, 3.3]}
                    texture={wood}
                    castShadow
                />
            ))}
        </>
    );
}
