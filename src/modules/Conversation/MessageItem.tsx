import { motion } from 'framer-motion'

import ImageFallback from '@/components/ImageFallback'
import { memo } from 'react'

type TMessageItemProps = { msg: string; by_me: boolean; isAnimateMessage: boolean }
const MessageItem: React.FC<TMessageItemProps> = ({ msg, by_me, isAnimateMessage }) => {
  const isBot = !by_me
  return (
    <div className={`flex items-end gap-1 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className='h-12 w-16'>
          <ImageFallback src='/robot.png' className={`size-full scale-85`} />
        </div>
      )}
      <motion.div
        // initial={{ opacity: 0, x: isBot ? 0 : -100, y: isBot ? 0 : 10 }}
        // animate={{
        //   opacity: 1,
        //   x: 0,
        //   y: 0,
        //   transition: isBot
        //     ? {
        //         duration: 0.1
        //       }
        //     : {
        //         x: {
        //           delay: 0.1,
        //           type: 'tween',
        //           stiffness: 100,
        //           duration: 0.1
        //         },
        //         y: {
        //           duration: 0.1
        //         }
        //       }
        // }}
        // transition={{ duration: 0.2 }}
        // viewport={{ once: true }}
        className={`max-w-[80%] break-words rounded-lg p-2 px-3 ${isBot ? 'relative bg-primary-light-gray' : 'bg-[#FFFAEA]'}`}
      >
        {/* {isBot ? (
          <TypewriterEffect words={msg} onComplete={onComplete} />
        ) : (
          <pre className='font-inter break-words' style={{ whiteSpace: 'pre-wrap' }}>
            {msg}
          </pre>
        )} */}
        <pre className='font-inter break-words' style={{ whiteSpace: 'pre-wrap' }}>
          {msg}
        </pre>
      </motion.div>
    </div>
  )
}

export default memo(MessageItem)
