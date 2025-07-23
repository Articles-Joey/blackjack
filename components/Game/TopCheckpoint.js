import { useBox } from "@react-three/cannon"

export default function TopCheckpoint({position, args}) {

    const [ref, api] = useBox(() => ({
        // mass: 50,
        // type: 'Dynamic',
        isTrigger: true,
        args: args,
        position: position,
        userData: {
            topCheckpoint: true
        }
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial transparent={true} opacity={0.25} color="red" />
        </mesh>
    )
}