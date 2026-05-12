import React, { useEffect, useRef, useState } from 'react'
import { initCanvas } from './Frames'
import { MainMenuComponent } from './MainMenuComponent'
import { startSignIn, handleCallback, getStoredIdToken } from './auth'

type AuthState = 'loading' | 'unauthenticated' | 'authenticated'

export function App() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [authState, setAuthState] = useState<AuthState>('loading')

    useEffect(() => {
        async function init() {
            const params = new URLSearchParams(window.location.search)
            const code = params.get('code')
            const state = params.get('state')

            if (code && state) {
                const ok = await handleCallback(code, state)
                history.replaceState(null, '', window.location.origin)
                setAuthState(ok ? 'authenticated' : 'unauthenticated')
                return
            }

            const token = getStoredIdToken()
            setAuthState(token ? 'authenticated' : 'unauthenticated')
        }
        init()
    }, [])

    useEffect(() => {
        if (authState === 'authenticated' && canvasRef.current) {
            initCanvas(canvasRef.current)
        }
    }, [authState])

    if (authState === 'loading') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: '#000' }}>
                <span style={{ color: 'gold', fontSize: 32, fontFamily: 'serif' }}>Lucy</span>
            </div>
        )
    }

    if (authState === 'unauthenticated') {
        return (
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'gold', fontSize: 48, fontFamily: 'serif' }}>Lucy</span>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <button
                        onClick={startSignIn}
                        style={{
                            background: 'transparent',
                            border: '1px solid #888',
                            color: '#ccc',
                            padding: '6px 18px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontFamily: 'sans-serif',
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#000' }}>
            <MainMenuComponent />
            <div
                ref={canvasRef}
                style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
            />
        </div>
    )
}
