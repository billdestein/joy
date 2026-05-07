import { useState, useEffect, useCallback } from 'react'
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js'
import type { CognitoUserSession } from 'amazon-cognito-identity-js'
import { Canvas, Frame, useFrameMessage } from 'react-better-frames'
import type { FrameButton } from 'react-better-frames'

type WorkbookType = {
    workbookName: string
    pics: { createdAt: number; filename: string; mimeType: string }[]
    prompts: { createdAt: number; focused: boolean; text: string }[]
}

function CloseIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
        </svg>
    )
}

function closeButtons(id: string): FrameButton[] {
    return [{ icon: <CloseIcon />, handler: () => Canvas.removeFrame(id), tooltip: 'close' }]
}

function Spinner() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div style={{
                width: 40,
                height: 40,
                border: '3px solid #333',
                borderTopColor: 'gold',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

function ImageApplet({ prompt, workbookName }: { prompt: string; workbookName: string }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function generate() {
            try {
                await fetch('/v1/workbooks/create-workbook', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workbookName }),
                })

                const workbook: WorkbookType = {
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

                if (!res.ok) throw new Error(`Generate failed: ${res.status}`)
                const data = await res.json() as { workbook: WorkbookType; image: string }
                const mimeType = data.workbook.pics[data.workbook.pics.length - 1]?.mimeType ?? 'image/png'

                if (!cancelled) {
                    setImageSrc(`data:${mimeType};base64,${data.image}`)
                    setLoading(false)
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Failed to generate image')
                    setLoading(false)
                }
            }
        }

        generate()
        return () => { cancelled = true }
    }, [prompt, workbookName])

    if (loading) return <Spinner />
    if (error) return <div style={{ color: '#c88', padding: 12, fontSize: 13 }}>{error}</div>
    return (
        <img
            src={imageSrc!}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            alt={prompt}
        />
    )
}

function ModalContent() {
    const close = useFrameMessage<() => void>()
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 24 }}>
            <div style={{ fontSize: 16, color: 'gold' }}>Modal Frame Demo</div>
            <div style={{ fontSize: 13, color: '#aaa', textAlign: 'center' }}>
                This frame is modal — it blocks interaction with the canvas behind it.
            </div>
            <button
                style={{ padding: '6px 20px', background: '#000', color: 'gold', border: '1px solid gold', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                onClick={close}
            >
                Close
            </button>
        </div>
    )
}

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
    const [loggedIn, setLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const canvasRef = useCallback((el: HTMLDivElement | null) => {
        if (el) Canvas.init(el)
    }, [])

    if (!loggedIn) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 20 }}>
                    <button
                        style={{ padding: '6px 18px', background: '#000', color: 'gold', border: '1px solid gold', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => setShowLogin(true)}
                    >
                        Sign In
                    </button>
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

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 48, background: '#111', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
                <span style={{ color: 'gold', fontWeight: 700, fontSize: 15, letterSpacing: 2, marginRight: 16 }}>Lucy</span>
                <button style={{ padding: '4px 14px', background: '#000', color: '#ccc', border: '1px solid #444', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}>
                    New Workbook
                </button>
                <button
                    style={{ padding: '4px 14px', background: '#000', color: 'gold', border: '1px solid #555', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                    onClick={() => setShowModal(true)}
                >
                    Modal Demo
                </button>
            </div>
            <div ref={canvasRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0a15' }}>
                <Frame id="dog" height={420} width={480} x={40} y={30} buttons={closeButtons('dog')}>
                    <ImageApplet prompt="Show me a dog" workbookName="frames-dog" />
                </Frame>
                <Frame id="cat" height={420} width={480} x={560} y={30} buttons={closeButtons('cat')}>
                    <ImageApplet prompt="Show me a cat" workbookName="frames-cat" />
                </Frame>
                {showModal && (
                    <Frame id="modal" height={220} width={360} isModal message={() => setShowModal(false)}>
                        <ModalContent />
                    </Frame>
                )}
            </div>
        </div>
    )
}
