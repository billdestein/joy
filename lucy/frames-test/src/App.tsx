import { useState } from 'react'
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js'
import type { CognitoUserSession } from 'amazon-cognito-identity-js'

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')

    const handleSignIn = async () => {
        setStatus('Authenticating…')
        try {
            const poolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined
            const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined
            if (!poolId || !clientId) {
                setStatus('Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in .env.local')
                return
            }
            const pool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId })
            const cognitoUser = new CognitoUser({ Username: email, Pool: pool })
            const authDetails = new AuthenticationDetails({ Username: email, Password: password })
            const token = await new Promise<string>((resolve, reject) => {
                cognitoUser.authenticateUser(authDetails, {
                    onSuccess: (session: CognitoUserSession) => resolve(session.getAccessToken().getJwtToken()),
                    onFailure: reject,
                })
            })
            const res = await fetch('/v1/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                onSuccess()
            } else {
                setStatus('Backend login failed')
            }
        } catch (e: unknown) {
            setStatus(e instanceof Error ? e.message : 'Authentication failed')
        }
    }

    const inputStyle: React.CSSProperties = {
        padding: '8px 12px',
        background: '#000',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: 3,
        fontSize: 14,
        outline: 'none',
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#111', border: '1px solid #555', borderRadius: 6, padding: 28, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ color: 'gold', fontSize: 18, fontWeight: 700 }}>Sign In</div>
                <input
                    style={inputStyle}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                />
                <input
                    style={inputStyle}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSignIn() }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        style={{ flex: 1, padding: '8px 0', background: '#000', color: 'gold', border: '1px solid gold', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                        onClick={handleSignIn}
                    >
                        Sign In
                    </button>
                    <button
                        style={{ padding: '8px 14px', background: '#000', color: '#888', border: '1px solid #444', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
                {status && (
                    <div style={{ fontSize: 12, color: status.includes('failed') || status.startsWith('Set ') ? '#c88' : '#8c8' }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function App() {
    const [showLogin, setShowLogin] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 20 }}>
                {loggedIn ? (
                    <span style={{ color: '#888', fontSize: 13 }}>Signed in</span>
                ) : (
                    <button
                        style={{ padding: '6px 18px', background: '#000', color: 'gold', border: '1px solid gold', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => setShowLogin(true)}
                    >
                        Sign In
                    </button>
                )}
            </div>

            <span style={{ color: 'gold', fontSize: 80, fontWeight: 700, letterSpacing: 10 }}>Lucy</span>

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSuccess={() => { setLoggedIn(true); setShowLogin(false) }}
                />
            )}
        </div>
    )
}
