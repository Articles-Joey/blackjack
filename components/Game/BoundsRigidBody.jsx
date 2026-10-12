"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Box3, Matrix4, Vector3 } from "three";

// One collider around the combined visible meshes, rather than one per mesh.
export default function BoundsRigidBody({ children, name }) {
    const group = useRef(null);
    const [bounds, setBounds] = useState(null);

    useLayoutEffect(() => {
        const root = group.current;
        if (!root) return;
        root.updateWorldMatrix(true, true);
        const inverse = root.matrixWorld.clone().invert();
        const transform = new Matrix4();
        const box = new Box3();
        const meshBox = new Box3();
        root.traverseVisible((object) => {
            if (!object.isMesh || !object.geometry?.attributes.position) return;
            const geometry = object.geometry;
            if (!geometry.boundingBox) geometry.computeBoundingBox();
            transform.multiplyMatrices(inverse, object.matrixWorld);
            meshBox.copy(geometry.boundingBox).applyMatrix4(transform);
            box.union(meshBox);
        });
        if (box.isEmpty()) return;
        setBounds({
            position: box.getCenter(new Vector3()).toArray(),
            halfExtents: box
                .getSize(new Vector3())
                .multiplyScalar(0.5)
                .toArray(),
        });
    }, [children]);

    return (
        <RigidBody
            type="fixed"
            colliders={false}
            name={name}
        >
            <group ref={group}>{children}</group>
            {bounds && (
                <CuboidCollider
                    args={bounds.halfExtents}
                    position={bounds.position}
                />
            )}
        </RigidBody>
    );
}
