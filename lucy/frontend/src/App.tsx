import React, { useState, useEffect, useRef } from 'react'
import { initCanvas } from './Frames'
import MainMenuComponent from './MainMenuComponent'
import { startLogin, handleCallback, getStoredToken } from './auth'

type AuthState = 'loading' | 'unauthenticated' | 'authenticated'

export default function App() {
    const [authState, setAuthState] = useState<AuthState>('loading')
    const canvasRef = useRef<HTMLDivElement>(null)
    const canvasInited = useRef(false)

    useEffect(() => {
        async function init() {
            const isCallback = window.location.search.includes('code=') && window.location.search.includes('state=')
            if (isCallback) {
                const ok = await handleCallback()
                if (ok) {
                    setAuthState('authenticated')
                    return
                }
            }
            const token = getStoredToken()
            setAuthState(token ? 'authenticated' : 'unauthenticated')
        }
        init()
    }, [])

    useEffect(() => {
        if (authState === 'authenticated' && canvasRef.current && !canvasInited.current) {
            initCanvas(canvasRef.current)
            canvasInited.current = true
        }
    }, [authState])

    if (authState === 'loading') {
        return (
            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#888', fontSize: '16px' }}>Loading...</div>
            </div>
        )
    }

    if (authState === 'unauthenticated') {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}>
                <div style={{ color: 'gold', fontSize: '48px', fontWeight: 'bold', letterSpacing: '8px' }}>Lucy</div>
                <button
                    onClick={startLogin}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '20px',
                        background: '#1a1a3a',
                        border: '1px solid #555',
                        color: '#ccc',
                        padding: '6px 18px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
            <MainMenuComponent />
            <div
                ref={canvasRef}
                style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
            />
        </div>
    )
}
