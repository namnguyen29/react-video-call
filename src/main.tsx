import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './lib/auth'
import { router } from './router'

const rootElement = document.getElementById('app')

function AppRouter() {
  const auth = useAuth()

  return <RouterProvider router={router} context={{ auth }} />
}

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <AuthProvider>
      <AppRouter />
    </AuthProvider>,
  )
}
