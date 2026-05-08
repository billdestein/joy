import { useAuth } from 'react-oidc-context'

export default function App() {
    const auth = useAuth()

    if (auth.isLoading) {
        return <div style={{ backgroundColor: 'black', height: '100%' }} />
    }

    if (auth.isAuthenticated) {
        return (
            <div style={{
                backgroundColor: 'blue',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{ color: 'white', fontSize: '2rem' }}>Welcome Bill</span>
            </div>
        )
    }

    return (
        <div style={{
            backgroundColor: 'black',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            <span style={{ color: 'gold', fontSize: '2rem' }}>Lucy</span>
            <button
                onClick={() => auth.signinRedirect()}
                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
                Sign In
            </button>
        </div>
    )
}
