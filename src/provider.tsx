import { NextUIProvider } from '@nextui-org/system'
import { useNavigate } from 'react-router-dom'
import store from '@/store'
import { Provider as ReduxProvider } from 'react-redux'
import Wrapper from './wrapper'
import { ToastContainer } from 'react-toastify'

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <NextUIProvider navigate={navigate}>
      <ReduxProvider store={store}>
        <ToastContainer />
        <Wrapper>{children}</Wrapper>
      </ReduxProvider>
    </NextUIProvider>
  )
}
