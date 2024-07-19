import { useMotionValue, useSpring } from 'framer-motion'
import { memo, useEffect } from 'react'
import GoogleGeminiEffect from '../GoogleGeminiEffect'

const AILoading = ({ handleTimeEnd }: { handleTimeEnd: () => void }) => {
  const value = useMotionValue(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (value.get() >= 2) return handleTimeEnd()
      value.set(value.get() + 0.1)
    }, 80) // Update every 2000 milliseconds (2 seconds)

    return () => clearInterval(interval)
  }, [value])

  const valueLength = useSpring(value, { stiffness: 100, damping: 20 })

  return (
    <div className='sticky left-0 right-0 top-0'>
      <GoogleGeminiEffect pathLengths={[valueLength, valueLength, valueLength, valueLength, valueLength]} />
    </div>
  )
}

export default memo(AILoading)
