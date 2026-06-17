import React, { createContext, useContext } from 'react'

// No-op Socket context — all data is demo/mock, no backend required.
const SocketContext = createContext<null>(null)

export function useSocket() {
    return useContext(SocketContext)
}

export const SocketProvider: React.FC<{ tenantId?: string; children: React.ReactNode }> = ({ children }) => {
    return <SocketContext.Provider value={null}>{children}</SocketContext.Provider>
}

export default SocketContext
