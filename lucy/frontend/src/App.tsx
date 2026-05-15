import React, { useState, useEffect, useRef } from 'react'
import { getStoredToken, handleCallback, callLoginEndpoint, signIn } from './auth'
import { initCanvas, addFrame } from './canvas'
import MainMenuComponent from './components/MainMenuComponent'

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)
    const canvasRef = useRef<HTMLDivElement>(null)
    const canvasInitialized = useRef(false)

    useEffect(() => {
        async function init() {
            const params = new URLSearchParams(window.location.search)
            if (params.has('code')) {
                try {
                    const idToken = await handleCallback()
                    await callLoginEndpoint(idToken)
                    setIsLoggedIn(true)
                } catch (err) {
                    console.error('Auth callback error:', err)
                }
            } else {
                const token = getStoredToken()
                if (token) {
                    try {
                        await callLoginEndpoint(token)
                        setIsLoggedIn(true)
                    } catch {
                        setIsLoggedIn(false)
                    }
                }
            }
            setAuthLoading(false)
        }
        init()
    }, [])

    useEffect(() => {
        if (isLoggedIn && canvasRef.current && !canvasInitialized.current) {
            canvasInitialized.current = true
            initCanvas(canvasRef.current)
            import('./frames/WorkbookListFrame').then(m => {
                addFrame(m.default, { width: 700, height: 400 })
            })
        }
    }, [isLoggedIn])

    if (authLoading) {
        return <div style={{ width: '100vw', height: '100vh', background: '#000' }} />
    }

    if (!isLoggedIn) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'gold', fontSize: 48, fontWeight: 'bold' }}>Lucy</span>
                <button
                    onClick={signIn}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: '#0078d4',
                        border: 'none',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e' }}>
            <MainMenuComponent />
            <div
                ref={canvasRef}
                className="lucy-canvas"
                style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
            />
        </div>
    )
}
