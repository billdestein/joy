import React, { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { Canvas } from './Frames/Canvas'
import { MainMenuComponent } from './MainMenuComponent'

const BACKEND = 'http://localhost:8080'

export default function App() {
  const auth = useAuth()
  const backendLoginDone = useRef(false)

  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !backendLoginDone.current) {
      backendLoginDone.current = true
      fetch(`${BACKEND}/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${auth.user.id_token}` },
      }).catch(err => console.error('Backend login error:', err))
    }
  }, [auth.isAuthenticated, auth.user])

  if (auth.isLoading) {
    return (
      <div style={styles.splash}>
        <span style={styles.title}>Lucy</span>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div style={styles.splash}>
        <span style={styles.title}>Lucy</span>
        <button style={styles.signinBtn} onClick={() => auth.signinRedirect()}>
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div style={styles.appContainer}>
      <MainMenuComponent />
      <Canvas />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  splash: {
    width: '100vw',
    height: '100vh',
    background: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    color: 'gold',
    fontSize: 64,
    fontFamily: 'serif',
    letterSpacing: 8,
  },
  signinBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: '8px 16px',
    background: 'transparent',
    color: 'gold',
    border: '1px solid gold',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
  },
  appContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a1a',
    overflow: 'hidden',
  },
}
