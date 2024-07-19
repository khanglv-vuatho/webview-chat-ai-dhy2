import { Route, Routes } from 'react-router-dom'

import './style.css'
import { lazy, Suspense } from 'react'
import { CircularProgress } from '@nextui-org/react'
const Home = lazy(() => import('./pages/index'))
const InvalidPage = lazy(() => import('./pages/invalid'))

const routes = [
  { path: '/', element: <Home /> },
  { path: '/invalid', element: <InvalidPage /> }
]

function App() {
  return (
    <Suspense
      fallback={
        <div className='flex h-dvh w-full items-center justify-center'>
          <CircularProgress
            classNames={{
              svg: 'h-8 w-8 text-primary-blue'
            }}
          />
        </div>
      }
    >
      <Routes>
        {routes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Routes>
    </Suspense>
  )
}

export default App
