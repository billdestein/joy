const TOKEN_KEY = 'lucy_id_token'
const STATE_KEY = 'lucy_pkce_state'
const VERIFIER_KEY = 'lucy_pkce_verifier'

async function sha256(plain: string): Promise<ArrayBuffer> {
    const data = new TextEncoder().encode(plain)
    return crypto.subtle.digest('SHA-256', data)
}

function base64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let str = ''
    for (const b of bytes) str += String.fromCharCode(b)
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function randomBase64url(len: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(len))
    let str = ''
    for (const b of bytes) str += String.fromCharCode(b)
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getDiscoveryDoc(): Promise<Record<string, string>> {
    const authority = import.meta.env.VITE_COGNITO_AUTHORITY as string
    const res = await fetch(`${authority}/.well-known/openid-configuration`)
    return res.json()
}

export async function signIn(): Promise<void> {
    const doc = await getDiscoveryDoc()
    const state = randomBase64url(16)
    const verifier = randomBase64url(32)
    const challenge = base64url(await sha256(verifier))

    localStorage.setItem(STATE_KEY, state)
    localStorage.setItem(VERIFIER_KEY, verifier)

    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: window.location.origin,
        scope: 'openid email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    })

    window.location.href = `${doc['authorization_endpoint']}?${params}`
}

export async function handleCallback(): Promise<string> {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')!
    const returnedState = params.get('state')!
    const storedState = localStorage.getItem(STATE_KEY)

    if (returnedState !== storedState) throw new Error('State mismatch')

    const verifier = localStorage.getItem(VERIFIER_KEY)!
    const doc = await getDiscoveryDoc()
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: window.location.origin,
        client_id: clientId,
        code_verifier: verifier,
    })

    const res = await fetch(doc['token_endpoint'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    })

    const tokens = await res.json()
    const idToken: string = tokens['id_token']
    localStorage.setItem(TOKEN_KEY, idToken)
    localStorage.removeItem(STATE_KEY)
    localStorage.removeItem(VERIFIER_KEY)

    history.replaceState({}, '', window.location.origin)
    return idToken
}

export function getStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null

    try {
        const payload = JSON.parse(
            atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        )
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem(TOKEN_KEY)
            return null
        }
        return token
    } catch {
        return null
    }
}

export async function callLoginEndpoint(idToken: string): Promise<void> {
    await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { Authorization: idToken },
        credentials: 'include',
    })
}

export async function signOut(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STATE_KEY)
    localStorage.removeItem(VERIFIER_KEY)
    window.location.href = window.location.origin
}
