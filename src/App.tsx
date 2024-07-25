import { Route, Routes } from 'react-router-dom'

import './style.css'
import { lazy, Suspense } from 'react'
import AILoading from './modules/AILoading'

const Home = lazy(() => import('./pages/index'))
const InvalidPage = lazy(() => import('./pages/invalid'))

const routes = [
  { path: '/', element: <Home /> },
  { path: '/invalid', element: <InvalidPage /> }
]

function App() {
  return (
    <Suspense fallback={<AILoading />}>
      <Routes>
        {routes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Routes>
    </Suspense>
  )
}

export default App
