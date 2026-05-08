import React, { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { Canvas, CanvasComponent } from './Frames'
import WorkbookListApplet from './WorkbookListApplet'

export default function App() {
    const auth = useAuth()
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.access_token && !sessionReady) {
            fetch('/v1/auth/login', {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.user.id_token}` },
                credentials: 'include',
            })
                .then(() => setSessionReady(true))
                .catch(console.error)
        }
    }, [auth.isAuthenticated, auth.user?.access_token])

    if (auth.isLoading) return null

    if (!auth.isAuthenticated) {
        return (
            <div
                style={{
                    background: 'black',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                <span style={{ color: 'gold', fontSize: 48, fontWeight: 'bold' }}>Lucy</span>
                <button
                    onClick={() => auth.signinRedirect()}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        background: '#222',
                        color: 'white',
                        border: '1px solid #555',
                        borderRadius: 4,
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    if (!sessionReady) {
        return <div style={{ background: 'black', height: '100vh' }} />
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ display: 'flex', padding: 8, background: '#111', gap: 8, flexShrink: 0 }}>
                <button
                    style={{
                        padding: '4px 12px',
                        cursor: 'pointer',
                        background: '#333',
                        color: 'white',
                        border: '1px solid #555',
                        borderRadius: 4,
                    }}
                    onClick={() => {
                        let id: string
                        id = Canvas.add(
                            {
                                height: 400,
                                width: 600,
                                x: 50,
                                y: 50,
                                isModal: false,
                                buttons: [
                                    {
                                        icon: <span>&#x2715;</span>,
                                        onClick: () => Canvas.remove(id),
                                        tooltip: 'Close',
                                    },
                                ],
                            },
                            <WorkbookListApplet />
                        )
                    }}
                >
                    Workbooks
                </button>
            </div>
            <CanvasComponent />
        </div>
    )
}
