import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { CanvasHost } from './Frames'
import MainMenuComponent from './MainMenuComponent'

export default function App() {
    const auth = useAuth()
    const backendLoginCalled = useRef(false)

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.id_token && !backendLoginCalled.current) {
            backendLoginCalled.current = true
            fetch('/v1/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { Authorization: `Bearer ${auth.user.id_token}` },
            }).catch(console.error)
        }
    }, [auth.isAuthenticated, auth.user?.id_token])

    if (auth.isLoading) {
        return <div style={fullscreen('#000')} />
    }

    if (!auth.isAuthenticated) {
        return (
            <div style={{ ...fullscreen('#000'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'gold', fontSize: 48, fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                    Lucy
                </div>
                <button
                    onClick={() => auth.signinRedirect()}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'transparent',
                        border: '1px solid gold',
                        color: 'gold',
                        padding: '6px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontFamily: 'sans-serif',
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div style={{ ...fullscreen('#111'), display: 'flex', flexDirection: 'column' }}>
            <MainMenuComponent />
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <CanvasHost />
            </div>
        </div>
    )
}

function fullscreen(bg: string): React.CSSProperties {
    return { width: '100%', height: '100%', background: bg, position: 'relative' }
}
