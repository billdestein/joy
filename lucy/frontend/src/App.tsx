import React, { useEffect, useState } from 'react'
import { MainMenuComponent } from './MainMenuComponent'
import { Canvas } from './Frames'

const AUTHORITY = import.meta.env.VITE_COGNITO_AUTHORITY
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const REDIRECT_URI = window.location.origin

function randomString(len: number): string {
    const bytes = new Uint8Array(len)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Base64Url(str: string): Promise<string> {
    const data = new TextEncoder().encode(str)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

let _discoveryCache: { authorization_endpoint: string; token_endpoint: string } | null = null

async function fetchDiscovery() {
    if (_discoveryCache) return _discoveryCache
    const res = await fetch(`${AUTHORITY}/.well-known/openid-configuration`)
    _discoveryCache = await res.json()
    return _discoveryCache!
}

async function startSignIn(): Promise<void> {
    const state = randomString(32)
    const verifier = randomString(64)
    const challenge = await sha256Base64Url(verifier)
    localStorage.setItem('oidc_state', state)
    localStorage.setItem('oidc_verifier', verifier)
    const { authorization_endpoint } = await fetchDiscovery()
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    })
    window.location.href = `${authorization_endpoint}?${params}`
}

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return Date.now() / 1000 > (payload.exp as number)
    } catch {
        return true
    }
}

async function processCallback(): Promise<string | null> {
    const search = new URLSearchParams(window.location.search)
    const code = search.get('code')
    const returnedState = search.get('state')
    if (!code || !returnedState) return null

    window.history.replaceState({}, '', window.location.pathname)

    const storedState = localStorage.getItem('oidc_state')
    const verifier = localStorage.getItem('oidc_verifier')
    localStorage.removeItem('oidc_state')
    localStorage.removeItem('oidc_verifier')

    if (!storedState || !verifier || returnedState !== storedState) {
        console.warn('OIDC state mismatch — ignoring stale callback')
        return null
    }

    const { token_endpoint } = await fetchDiscovery()
    const tokenRes = await fetch(token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code,
            code_verifier: verifier,
        }),
    })

    if (!tokenRes.ok) {
        const body = await tokenRes.text()
        throw new Error(`Token exchange failed (${tokenRes.status}): ${body}`)
    }

    const tokens = (await tokenRes.json()) as { id_token: string }
    localStorage.setItem('oidc_id_token', tokens.id_token)
    return tokens.id_token
}

export function App() {
    const [loading, setLoading] = useState(true)
    const [idToken, setIdToken] = useState<string | null>(null)
    const [backendReady, setBackendReady] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            try {
                if (new URLSearchParams(window.location.search).has('code')) {
                    const token = await processCallback()
                    setIdToken(token)
                } else {
                    const stored = localStorage.getItem('oidc_id_token')
                    if (stored && !isTokenExpired(stored)) {
                        setIdToken(stored)
                    } else {
                        localStorage.removeItem('oidc_id_token')
                    }
                }
            } catch (err) {
                console.error('Auth error:', err)
                setAuthError(String(err))
            } finally {
                setLoading(false)
            }
        }
        void init()
    }, [])

    useEffect(() => {
        if (!idToken || backendReady) return
        fetch('/v1/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { Authorization: `Bearer ${idToken}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Backend login failed: ${res.status}`)
                setBackendReady(true)
            })
            .catch((err) => {
                console.error('Backend login error:', err)
                localStorage.removeItem('oidc_id_token')
                setIdToken(null)
            })
    }, [idToken, backendReady])

    if (loading) {
        return <div style={blackScreen}><span style={lucyTitle}>Lucy</span></div>
    }

    if (authError) {
        return (
            <div style={blackScreen}>
                <span style={{ color: '#cc4444', fontSize: 13, padding: 20, textAlign: 'center' }}>
                    {authError}
                </span>
                <button
                    onClick={() => { setAuthError(null); void startSignIn() }}
                    style={signInBtnStyle}
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!idToken) {
        return (
            <div style={blackScreen}>
                <span style={lucyTitle}>Lucy</span>
                <button
                    onClick={() => startSignIn().catch((e) => setAuthError(String(e)))}
                    style={signInBtnStyle}
                >
                    Sign In
                </button>
            </div>
        )
    }

    if (!backendReady) {
        return <div style={blackScreen}><span style={lucyTitle}>Lucy</span></div>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <MainMenuComponent />
            <Canvas />
        </div>
    )
}

const blackScreen: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'column',
}

const lucyTitle: React.CSSProperties = {
    color: 'gold',
    fontSize: 48,
    fontFamily: 'Georgia, serif',
    letterSpacing: 6,
}

const signInBtnStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    right: 16,
    background: '#2a4060',
    color: '#cce0ff',
    border: '1px solid #3a5070',
    borderRadius: 4,
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: 13,
}
