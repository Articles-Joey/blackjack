"use client";
import { useState, useEffect, useContext, useRef, memo } from 'react'

import { useRouter, usePathname } from 'next/navigation';

// Import session to detect change to sign in and sign out of socket
// import { useSession } from 'lib/hooks'

// import { useSelector, useDispatch } from 'react-redux'

// import { format } from 'date-fns'

import axios from "axios";

import { useSocketStore } from "@/hooks/useSocketStore";

// SocketContextControl
export default function SocketLogicHandler(props) {

    const router = useRouter()
    const pathname = usePathname()

    // const userReduxState = useSelector((state) => state.auth.user_details)

    const socket = useSocketStore((state) => state.socket)
    const connectSocket = useSocketStore((state) => state.connectSocket)
    const disconnectSocket = useSocketStore((state) => state.disconnectSocket)
    const setTotalUsers = useSocketStore((state) => state.setTotalUsers)

    const connected = useSocketStore((state) => state.connected)
    const setConnected = useSocketStore((state) => state.setConnected)

    // const {
    //     socket,
    //     // totalUsers,
    //     setTotalUsers,
    //     connectSocket
    // } = useSocketStore(state => ({
    //     socket: state.socket,
    //     // totalUsers: state.totalUsers,
    //     setTotalUsers: state.setTotalUsers,
    //     connectSocket: state.connectSocket,
    // }));

    const [lastPage, setLastPage] = useState('');

    // const [initialConnectAttempt, setInitialConnectAttempt] = useState(false);
    const initialized = useRef(false)

    // const { session, status } = useSession()

    // function onConnect() {
    //     console.log("Connect Event")
    //     setIsConnected(true);
    //     socket.emit('getUserCount');
    // }

    // function onDisconnect() {
    //     console.log("Disconnect Event")
    //     setIsConnected(false);
    // }

    function userCount(value) {
        setTotalUsers(value)
        // setSocketData(prevState => ({
        //     ...prevState,
        //     total_users: value
        // }))
    }

    // useEffect(() => {

    //     if (!initialConnectAttempt) {

    //         console.log("Was called twice")
    //         setInitialConnectAttempt(true)
    //         connectSocket()
    //     }

    // }, [initialConnectAttempt])

    useEffect(() => {

        // Makes sure connect is only called once during reactStrictMode
        if (!initialized.current) {
            initialized.current = true
            // connectSocket()
        }

        // if (!socket.connected) return

        socket.on('connect', () => {
            console.log("[📶Socket] Connected to server!");
            // setSocketData(prevState => ({
            //     ...prevState,
            //     connected: true
            // }))
            // socket.emit('activePage', router.pathname);
            setConnected(true);
            // socket.emit('login', { userId: userReduxState?._id })
            // socket.emit( 'isOnline', socketsToCheckIfOnline )
        });

        socket.on('disconnect', () => {
            console.log("[📶Socket] Disconnected from server!");
            // setSocketData(prevState => ({
            //     ...prevState,
            //     connected: false,
            //     authenticated: false
            // }))
            setConnected(false);
            // setSocketLoggedIn(false);
        });

        socket.on('force-page', (data) => {
            console.log("[📶Socket] You are being forced to a new page!");
            console.log(data)
            router.push(data.page)
            // setSocketData(prevState => ({
            //     ...prevState,
            //     connected: false,
            //     authenticated: false
            // }))
            // setConnected(false);
            // setSocketLoggedIn(false);
        });

        socket.on('roomsList', (value) => {
            console.log("[📶Socket] roomsList", value);
        });

        socket.emit('getUserCount');

        socket.on('userCount', userCount);

        console.log(`[📶 Socket] Page change emit`)
        socket.emit('activePage', pathname);

        // router.events.on('routeChangeStart', handleRouteChange)

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('force-page');
            socket.off('roomsList');
            socket.off('userCount', userCount);
            // router.events.off('routeChangeStart', handleRouteChange)
        };

    }, [socket]);

    useEffect(() => {

        // https://github.com/vercel/next.js/discussions/52568

        // return

        const handleRouteChange = (url) => {

            if (url == lastPage) {
                console.log("Same page, ignore event")
                return
            }

            setLastPage(prev => {
                console.log("Prev", prev)
                console.log("url", url)
                return url
            })

            // console.log(
            //     `App is changing to ${url} ${shallow ? 'with' : 'without'
            //     } shallow routing`,
            // );

            if (socket?.connected) {
                console.log(`[📶 Socket] Page change emit`)
                socket.emit('activePage', url);
            }

        };

        if (pathname !== lastPage) {
            console.log("User is at a new pathname")
            handleRouteChange(pathname)
        }

        // router.events.on('routeChangeStart', handleRouteChange);

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        // return () => {
        //     router.events.off('routeChangeStart', handleRouteChange);
        // };

    }, [pathname, lastPage]);

    // useEffect(() => {

    //     console.log("[📶Socket] Session has changed inside socket consumer")

    // }, [session])

    useEffect(() => {

        return

        console.log("socketData.connected")
        // console.log("Socket authenticated:", socket.authenticated)
        // console.log(userReduxState._id)

        if (
            socket?.connected
            &&
            !socket?.authenticated
            // && 
            // userReduxState._id
        ) {

            console.log("[📶Socket] Socket is now connected and not authenticated with a logged in user!")

            // return

            axios.get('/api/user/sockets/login', {
                params: {
                    socket: socket.id
                }
            })
                .then((response) => {
                    console.log("[📶Socket] socket-login Success")
                    console.log(response.data)
                    // setSocketData(prevState => ({
                    //     ...prevState,
                    //     authenticated: true
                    // }))
                })
                .catch(function (error) {
                    console.log("[📶Socket] socket-login Error")
                    console.log(error);
                });

            // socket.emit('login', { userId: userReduxState?._id, session: session })
            // setSocketLoggedIn(true);

            // socket.on('connect', () => {
            //     console.log("Connected to server!");
            //     setConnected(true);
            //     socket.emit('login', { userId: userReduxState?._id })
            //     // socket.emit( 'isOnline', socketsToCheckIfOnline )
            // });

        }

    }, [
        socket?.connected,
        // userReduxState._id
    ]);
}