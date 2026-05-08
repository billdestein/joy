import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import App from './App'

const oidcConfig = {
    authority: import.meta.env.VITE_COGNITO_AUTHORITY as string,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
    redirect_uri: window.location.origin,
    scope: 'openid email',
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider {...oidcConfig}>
            <App />
        </AuthProvider>
    </React.StrictMode>
)
