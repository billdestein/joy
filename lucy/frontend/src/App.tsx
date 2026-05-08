import { useAuth } from 'react-oidc-context'
import { useEffect, useRef } from 'react'

export default function App() {
    const auth = useAuth()
    const backendLoginDone = useRef(false)

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.access_token && !backendLoginDone.current) {
            backendLoginDone.current = true
            fetch('/v1/auth/login', {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.user.access_token}` },
                credentials: 'include'
            }).catch(console.error)
        }
    }, [auth.isAuthenticated, auth.user?.access_token])

    if (auth.isLoading) {
        return <div style={{ background: 'black', height: '100vh' }} />
    }

    if (!auth.isAuthenticated) {
        return (
            <div style={{
                background: 'black',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <h1 style={{ color: 'gold', fontSize: '4rem', fontFamily: 'sans-serif' }}>Lucy</h1>
                {auth.error && (
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        color: 'red',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        maxWidth: '80%',
                        textAlign: 'center'
                    }}>
                        Auth error: {auth.error.message}
                    </div>
                )}
                <button
                    onClick={() => auth.signinRedirect().catch(console.error)}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '8px 18px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: 'white'
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    const name = auth.user?.profile?.name
        ?? auth.user?.profile?.email
        ?? 'User'

    return (
        <div style={{
            background: 'blue',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h1 style={{ color: 'white', fontSize: '4rem', fontFamily: 'sans-serif' }}>
                Welcome {name}
            </h1>
        </div>
    )
}
