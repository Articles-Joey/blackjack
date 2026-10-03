"use client";

import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';

// import { useSelector, useDispatch } from 'react-redux'

// import { togglePrivacyMode } from "@/redux/actions/siteActions";
import ArticlesButton from '@/components/UI/Button';

export default function IsDev({className, noOutline, children, inline}) {

    // const dispatch = useDispatch()
    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [ isMounted, setIsMounted ] = useState()
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // If you just want to wrap the sensitive info instead of conditional rendering on page with privacy_mode selector
    // I think this is better but you can do either way
    if (children && userReduxState?.roles?.isDev && isMounted) {
        return (
            <Box className={className} sx={{ display: inline ? 'inline-block' : 'block', outline: noOutline ? 'none' : '1px dashed', outlineColor: 'warning.main' }}>{children}</Box>
        )
    }

    return

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <Box sx={{ fontSize: '0.875em', px: '0.65em', py: '0.35em', fontWeight: 700, lineHeight: 1, borderRadius: '0.375rem', bgcolor: '#212529', color: '#fff' }}>
                Privacy mode enabled
            </Box>

            <ArticlesButton
                sx={{ ml: 'auto' }}
                small
                onClick={() => {
                    // dispatch( togglePrivacyMode() )
                }}
            >
                Disable
            </ArticlesButton>

        </Box>
    )

}
