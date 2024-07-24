import { Message, TAllMessage, TConversation } from '@/types'
import { memo, useCallback, useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

type ConversationType = {
  conversation: Message[]
  isAnimateMessage: boolean
}

const Conversation: React.FC<ConversationType> = ({ conversation, isAnimateMessage }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
    bottomRef?.current?.scrollIntoView({ behavior: 'instant' })
  }, [bottomRef, conversation])

  return (
    <div className='flex h-full flex-col justify-end gap-2 overflow-y-auto px-4'>
      {conversation?.map((item, index) => <MessageItem isAnimateMessage={isAnimateMessage} key={index} by_me={item?.by_me} msg={item.content} />)}
      <div ref={bottomRef} /> {/* Bottom reference for auto-scrolling */}
    </div>
  )
}

export default memo(Conversation)
