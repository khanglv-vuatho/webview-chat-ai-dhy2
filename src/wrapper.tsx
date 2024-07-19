import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { TranslationProvider } from './context/translationProvider'
import { ActionTypes } from './store'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')
  const lang = queryParams.get('lang') || 'vi'

  const checkSession = useCallback(async () => {
    console.log('daszzcxzczxccxzczx')

    if (token) {
      dispatch({
        type: 'token',
        payload: token
      })
      dispatch({
        type: 'lang',
        payload: lang
      })
    } else {
      navigate('/invalid')
    }
  }, [navigate])

  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      dispatch({
        type: ActionTypes.TOKEN,
        payload: import.meta.env.VITE_TOKEN
      })
      return
    }

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor
      const regexString = import.meta.env.VITE_API_REGEX
      if (regexString) {
        try {
          const isAppWebView = regexString == ua
          if (isAppWebView) {
            checkSession()
          } else {
            navigate('/invalid')
          }
        } catch (error) {
          console.log({ error })
        }
      } else {
        console.error('VITE_API_REGEX is not defined')
      }
    }
  }, [navigate])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) return
      navigate('/invalid')
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <TranslationProvider lang={lang}>
      <div className='overscroll-none'>{children}</div>
    </TranslationProvider>
  )
}

export default Wrapper
