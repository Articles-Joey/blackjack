import { PointerLockControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"

export const FPV = ({ location, setLocation, menuOpen }) => {

    const { camera, gl } = useThree()

    const handleUpdate = () => {
        // Get the updated camera position
        const { x, y, z } = camera.position;

        // Update the location state with the new coordinates
        // setLocation({ x, y, z });
    };

    // if (menuOpen) return

    return (
        <PointerLockControls
            args={[camera, gl.domElement]}
            onUpdate={handleUpdate}
        />
    )

}