import { motion } from 'framer-motion'
import { memo, useEffect, useMemo } from 'react'

type TypewriterEffectProps = {
  words: string
  onComplete?: () => void
}
const TypewriterEffect = ({ words, onComplete }: TypewriterEffectProps) => {
  const word = words.split('')

  const time = useMemo(() => {
    return word.map((item, index) => {
      const delay = (index + 1) * 0.01 * item.length + 0.1
      return item.length * 0.05 + delay
    })
  }, [word])

  const lastTime = useMemo(() => time[time.length - 1], [time])

  useEffect(() => {
    if (!onComplete) return

    const timer = setTimeout(() => {
      onComplete?.()
    }, lastTime * 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [onComplete, lastTime])

  return (
    <>
      {word.map((item, index) => (
        <motion.span
          initial={{
            position: 'fixed',
            opacity: 0
          }}
          animate={{
            position: 'static',
            opacity: 1
          }}
          transition={{
            duration: 0.05,
            delay: (index + 1) * 0.01
          }}
          key={index}
          className='relative'
        >
          {item}
        </motion.span>
      ))}
    </>
  )
}

export default memo(TypewriterEffect)
