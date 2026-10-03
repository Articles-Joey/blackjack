"use client";

import Box from '@mui/material/Box';
import { memo, useEffect, useState } from "react";

import ArticlesButton from "@/components/UI/Button"
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

const arePropsEqual = (prevProps, nextProps) => {
    // Compare all props for equality
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

function JumpButtonBase() {

    const {
        touchControls, setTouchControls
    } = useTouchControlsStore()

    return (
        <ArticlesButton
            onClick={() => {
                console.log("Jump!")
                setTouchControls({
                    ...touchControls,
                    jump: true
                })
            }}
        >
            Jump
        </ArticlesButton>
    )
}

const JumpButton = memo(JumpButtonBase, arePropsEqual);

function TouchControlsBase(props) {

    const {
        touchControlsEnabled,
    } = props;

    const [nippleCreated, setNippleCreated] = useState(false)

    const [nStart, setnStart] = useState(false)
    const [nDirection, setnDirection] = useState(false)

    const {
        touchControls, setTouchControls
    } = useTouchControlsStore()

    function startNipple() {

        // console.log("n", nipplejs)

        // return

        var options = {
            zone: document.getElementById('zone_joystick'),
            // threshold: 0.5
            // lockX: true,
        };

        // var manager = nipplejs.create(options);
        var manager = require('nipplejs').create(options);

        setNippleCreated(true)

        let dragDistance
        let dragDirection

        manager.on('start end', function (evt, data) {
            // dump(evt.type);
            // debug(data);
            console.log("1", evt.type)

            if (evt.type == 'start') {
                setnStart(true)
            } else if (evt.type == 'end') {
                setnStart(false)
                setnDirection(false)
                dragDistance = 0
                dragDirection = false
                setTouchControls({
                    ...touchControls,
                    left: false,
                    right: false
                })
            }

        })
        .on('move', function (evt, data) {

            // debug(data);
            dragDistance = data.distance
            console.log("2", dragDistance)

            if (dragDistance > 15 && dragDirection) {

                if (dragDirection == 'left') setTouchControls({
                    ...touchControls,
                    left: true,
                    right: false
                })

                if (dragDirection == 'right') setTouchControls({
                    ...touchControls,
                    left: false,
                    right: true
                })

            } else {
                setTouchControls({
                    ...touchControls,
                    left: false,
                    right: false
                })
            }

        })
        .on(' ' +
            'dir:up plain:up dir:left plain:left dir:down ' +
            'plain:down dir:right plain:right',
            function (evt, data) {

                if (evt.type == 'move') {
                    dragDistance = data.distance
                }  
                
                // dump(evt.type);
                console.log("3", evt.type, dragDistance)

              

                if (evt.type == 'dir:left') {
                    dragDirection = 'left'
                    // setnDirection('left')
                    // setTouchControls({
                    //     ...touchControls,
                    //     left: true,
                    //     right: false
                    // })
                }

                if (evt.type == 'dir:right') {
                    dragDirection = 'right'
                    // setnDirection('right')
                    // setTouchControls({
                    //     ...touchControls,
                    //     left: false,
                    //     right: true
                    // })
                }

            }
        )
        .on('pressure', function (evt, data) {
            // debug({
            //   pressure: data
            // });
        });
    }

    useEffect(() => {

        if (!nippleCreated) {
            console.log("Load nipple")
            startNipple()
        }

    }, []);

    return (
        <Box sx={{ display: touchControlsEnabled ? 'block' : 'none' }}>

            <Box sx={{ display: 'flex' }}>

                <Box>
                    {/* <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            left: true
                        })
                    }}
                >
                    Left
                </ArticlesButton>
                <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            right: true
                        })
                    }}
                >
                    Right
                </ArticlesButton> */}
                    <Box sx={{
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'black'
                    }} id="zone_joystick"></Box>
                </Box>

                <Box sx={{ ml: '0.5rem', display: 'none', '@media (min-width: 992px)': { display: 'block' } }}>
                    <Box>Active: {nStart ? 'True' : 'False'}</Box>
                    <Box>Direction: {nDirection ? nDirection : 'None'}</Box>
                    <Box>Touch: {JSON.stringify(touchControls)}</Box>
                </Box>

            </Box>

            <JumpButton />

        </Box>
    )
}

const TouchControls = memo(TouchControlsBase, arePropsEqual);

export default TouchControls
