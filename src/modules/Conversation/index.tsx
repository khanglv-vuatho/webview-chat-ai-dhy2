import { Message } from '@/types'
import { memo, useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import { motion } from 'framer-motion'

type ConversationType = {
  conversation: Message[]
  isAnimateMessage: boolean
  setIsErrorWhenAIResponding: (value: boolean) => void
  isFocus: boolean
}

const Conversation: React.FC<ConversationType> = ({ conversation, isAnimateMessage, isFocus }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: 'instant' })
  }, [bottomRef, conversation, isFocus])

  const motionProps = !isAnimateMessage
    ? {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          x: 0,
          y: 0
        },
        transition: { delay: 0.1, duration: 0.2, ease: 'easeInOut' },
        viewport: { once: true }
      }
    : {}

  return (
    <motion.div {...motionProps} className='flex flex-col gap-2 px-4'>
      {conversation?.map((item, index) => <MessageItem isAnimateMessage={isAnimateMessage} key={index} by_me={item?.by_me} msg={item.content} />)}
      <div ref={bottomRef} /> {/* Bottom reference for auto-scrolling */}
    </motion.div>
  )
}

export default memo(Conversation)
