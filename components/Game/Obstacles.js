import { useSphere } from "@react-three/cannon";
import { memo, useEffect } from "react";

function Obstacles() {

    return (
        <group>

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 52, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[0, 50, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 54, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 100, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 100, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 150, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 150, 80]}
            />

        </group>
    )

}

export default memo(Obstacles)

function Obstacle({ args, position, rotation }) {

    const [ref, api] = useSphere(() => ({
        mass: 50,
        type: 'Dynamic',
        args: args,
        position: position,
        rotation: rotation
    }))

    // Generate a random color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    useEffect(() => {

        api.position.subscribe((p) => {

            if (p[1] < -10) {

                api.position.set(
                    position[0],
                    position[1],
                    position[2],
                );

                api.velocity.set(0, 0, 0);

            }

        })

    }, [api.position])

    return (
        <mesh ref={ref} castShadow>
            <sphereGeometry args={args} />
            <meshStandardMaterial color={randomColor} />
        </mesh>
    )

}