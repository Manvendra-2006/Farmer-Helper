import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import FireBaseProvider from './context/FireBaseProvider.jsx'
import { AuthProvider } from './context/Authcontext.jsx'
import "./index.css"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FireBaseProvider>
<AuthProvider>
<App/>
  </AuthProvider>
    </FireBaseProvider>
  
  
  </StrictMode>,
)
