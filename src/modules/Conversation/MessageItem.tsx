import { motion } from 'framer-motion'

import ImageFallback from '@/components/ImageFallback'
import { memo } from 'react'

type TMessageItemProps = { msg: string; by_me: boolean; isAnimateMessage: boolean }
const MessageItem: React.FC<TMessageItemProps> = ({ msg, by_me, isAnimateMessage }) => {
  const isBot = !by_me

  const motionProps = isAnimateMessage
    ? {
        initial: { opacity: 0, x: isBot ? 0 : -100, y: isBot ? 0 : 10 },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: isBot
            ? { duration: 0.1 }
            : {
                x: { delay: 0.1, type: 'tween', stiffness: 100, duration: 0.1 },
                y: { duration: 0.1 }
              }
        },
        transition: { duration: 0.2 },
        viewport: { once: true }
      }
    : {}

  if (msg === '') return null
  return (
    <div className={`flex items-end gap-1 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className='h-12 w-16'>
          <ImageFallback src='/robot.png' className={`size-full scale-85`} />
        </div>
      )}

      {isBot && msg === '...' ? (
        <motion.div className={`flex h-10 items-center gap-1 rounded-lg bg-blue-100 px-2`}>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className='h-1.5 w-1.5 rounded-full bg-primary-black'
                animate={{
                  y: [0, -4, 0],
                  transition: {
                    delay: index * 0.1,
                    duration: 0.3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 1
                  }
                }}
              />
            ))}
        </motion.div>
      ) : (
        <motion.div {...motionProps} className={`max-w-[70%] break-words rounded-lg p-2 px-3 ${isBot ? 'relative bg-primary-light-gray' : 'bg-[#FFFAEA]'}`}>
          <pre className='font-inter break-words' style={{ whiteSpace: 'pre-wrap' }}>
            {msg}
          </pre>
        </motion.div>
      )}
    </div>
  )
}

export default memo(MessageItem)
