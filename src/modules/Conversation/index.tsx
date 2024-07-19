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
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [bottomRef, conversation])

  return (
    <div className='flex flex-col gap-2 px-4'>
      {JSON.stringify(conversation)}
      {conversation?.map((item, index) => <MessageItem isAnimateMessage={isAnimateMessage} key={index} by_me={item?.by_me} msg={item.content} />)}
      <div ref={bottomRef} /> {/* Bottom reference for auto-scrolling */}
    </div>
  )
}

export default memo(Conversation)
