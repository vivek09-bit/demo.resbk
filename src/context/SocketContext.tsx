import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
    return useContext(SocketContext)
}

export const SocketProvider: React.FC<{ tenantId?: string; children: React.ReactNode }> = ({ tenantId, children }) => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (!tenantId) return
        const backend = import.meta.env.PROD ? undefined : 'http://localhost:4000'
        const s = io(backend || '/', { query: { tenant: tenantId } })
        setSocket(s)
        s.on('connect', () => console.log('socket connected', s.id))
        return () => { s.disconnect(); setSocket(null) }
    }, [tenantId])

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export default SocketContext
