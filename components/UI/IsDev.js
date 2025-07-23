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
            <div className={`is-dev-content ${noOutline && 'no-outline'} ${className} ${inline && 'd-inline-block'}`}>{children}</div>
        )
    }

    return

    return (
        <div className="d-flex align-items-center">

            <div className="small badge bg-dark">
                Privacy mode enabled
            </div>

            <ArticlesButton
                className="ms-auto"
                small
                onClick={() => {
                    // dispatch( togglePrivacyMode() )
                }}
            >
                Disable
            </ArticlesButton>

        </div>
    )

}