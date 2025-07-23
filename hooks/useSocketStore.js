// import { create } from "zustand";
import { createWithEqualityFn as create } from 'zustand/traditional'
import { io } from "socket.io-client";

export const useSocketStore = create((set) => ({
    // socket: null,
    socket: io({
        autoConnect: false
    }),
    serverUrl: process.env.NEXT_PUBLIC_NODE_SERVER, // Default server URL
    connectSocket: (url) => {
        console.log("[📶Socket] connectSocket called")
        const newSocket = io(url || process.env.NEXT_PUBLIC_NODE_SERVER, {
            transports: ["websocket"],
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionDelayMax: 10000,
        });
        newSocket.connect();
        set({ socket: newSocket });
    },
    setServerUrl: (url) => set({ serverUrl: url }),
    disconnectSocket: () => set((state) => {
        state.socket?.disconnect();
        return {}
        // Disconnect but do not dump socket store or socket.on and socket.connected will be undefined if not careful
        // return { socket: null };
    }),
    totalUsers: 0,
    setTotalUsers: (total) => set({ totalUsers: total }),
    connected: false,
    setConnected: (total) => set({ connected: total }),
}));