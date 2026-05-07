import { useEffect, useRef, useState } from 'react'
import { Canvas, Frame } from 'react-better-frames'
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js'
import type { CognitoUserSession } from 'amazon-cognito-identity-js'

const DOG_WORKBOOK = 'frames-test-dog'
const CAT_WORKBOOK = 'frames-test-cat'

const btnStyle: React.CSSProperties = {
    padding: '4px 14px',
    background: '#22224a',
    color: '#8888cc',
    border: '1px solid #44447a',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
}

async function callGeneratePic(workbookName: string, prompt: string): Promise<string | null> {
    const workbook = {
        workbookName,
        pics: [],
        prompts: [{ createdAt: Date.now(), focused: true, text: prompt }],
    }
    const res = await fetch('/v1/workbooks/generate-pic', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workbook }),
    })
    if (!res.ok) return null
    const data = await res.json() as { image?: string }
    return data.image ?? null
}

function ImageApplet({ prompt, workbookName }: { prompt: string; workbookName: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
    const [image, setImage] = useState<string | null>(null)

    const handleGenerate = async () => {
        setStatus('loading')
        try {
            const img = await callGeneratePic(workbookName, prompt)
            if (img) {
                setImage(img)
                setStatus('done')
            } else {
                setStatus('error')
            }
        } catch {
            setStatus('error')
        }
    }

    return (
        <div style={{ padding: 10, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={btnStyle} onClick={handleGenerate} disabled={status === 'loading'}>
                {status === 'loading' ? 'Generating…' : 'Generate'}
            </button>
            {status === 'error' && (
                <div style={{ color: '#c88888', fontSize: 12 }}>
                    Error — ensure the backend is running and you are logged in.
                </div>
            )}
            {image && (
                <img
                    src={`data:image/png;base64,${image}`}
                    alt={prompt}
                    style={{ maxWidth: '100%', flex: 1, objectFit: 'contain' }}
                />
            )}
        </div>
    )
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')

    const handleLogin = async () => {
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
        padding: '6px 10px',
        background: '#1a1a3a',
        color: '#b0b0d0',
        border: '1px solid #44447a',
        borderRadius: 3,
        fontSize: 12,
        width: '100%',
        boxSizing: 'border-box',
    }

    return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
                style={inputStyle}
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                style={inputStyle}
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            />
            <button style={{ ...btnStyle, justifyContent: 'center' }} onClick={handleLogin}>
                Login
            </button>
            {status && (
                <div style={{ color: status.includes('failed') || status.startsWith('Set ') ? '#c88888' : '#88c888', fontSize: 11 }}>
                    {status}
                </div>
            )}
        </div>
    )
}

export default function App() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(false)

    useEffect(() => {
        if (canvasRef.current) Canvas.init(canvasRef.current)
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '6px 16px',
                    background: '#16162e',
                    borderBottom: '1px solid #2a2a4a',
                    flexShrink: 0,
                }}
            >
                <span style={{ color: '#7070c0', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
                    frames-test
                </span>
                {loggedIn ? (
                    <span style={{ color: '#88c888', fontSize: 12 }}>● logged in</span>
                ) : (
                    <button style={btnStyle} onClick={() => setShowLogin(true)}>
                        Login
                    </button>
                )}
                <span style={{ color: '#444468', fontSize: 11 }}>
                    drag · resize · stack · restack
                </span>
            </div>

            <div
                ref={canvasRef}
                style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f0f1a' }}
            >
                <Frame width={340} height={300} x={40} y={40} title="Show me a dog">
                    <ImageApplet prompt="Show me a dog" workbookName={DOG_WORKBOOK} />
                </Frame>

                <Frame width={340} height={300} x={440} y={40} title="Show me a cat">
                    <ImageApplet prompt="Show me a cat" workbookName={CAT_WORKBOOK} />
                </Frame>

                {showLogin && (
                    <Frame width={340} height={230} isModal title="Login">
                        <LoginForm
                            onSuccess={() => {
                                setLoggedIn(true)
                                setShowLogin(false)
                            }}
                        />
                    </Frame>
                )}
            </div>
        </div>
    )
}
