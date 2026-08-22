import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Router from './router/Router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App