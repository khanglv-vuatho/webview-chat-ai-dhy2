import { Message } from '@/types'
import { motion } from 'framer-motion'
import { InfoCircle } from 'iconsax-react'
import Markdown from 'markdown-to-jsx'
import React, { memo } from 'react'

type TMessageItemProps = { msg: string; by_me: boolean; isAnimateMessage: boolean; isHasErrorMessage: boolean; handleResend: () => void }
const MessageItem: React.FC<TMessageItemProps> = ({ msg, by_me, isAnimateMessage, isHasErrorMessage, handleResend }) => {
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
      {isBot && msg === '...' ? (
        <motion.div className={`flex h-10 items-center gap-1 rounded-lg bg-primary-light-gray px-2`}>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className='h-1.5 w-1.5 rounded-full bg-primary-black/40'
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
        <div className={`flex w-full flex-col gap-1 ${isBot ? 'items-start' : 'items-end'}`}>
          <motion.div
            style={{ opacity: isHasErrorMessage ? 0.5 : 1 }}
            {...motionProps}
            className={`max-w-[70%] break-words rounded-lg p-2 px-3 ${isBot ? 'relative bg-primary-light-gray' : 'bg-[#FFFAEA]'}`}
          >
            <Markdown
              options={{
                overrides: {
                  component: ({ children, ...props }) => {
                    // Kết hợp strong với các phần tử tiếp theo
                    const text = React.Children.toArray(children).join('')
                    return <strong {...props}>{text}</strong>
                  },
                  ul: {
                    component: 'ul',
                    props: {
                      style: {
                        listStyleType: 'disc',
                        marginTop: '4px',
                        paddingLeft: '20px',
                        display: 'block'
                      }
                    }
                  },
                  ol: {
                    component: 'ol',
                    props: {
                      style: {
                        listStyleType: 'decimal',
                        paddingLeft: '4px',
                        marginTop: '10px',
                        listStylePosition: 'inside',
                        display: 'block'
                      }
                    }
                  },
                  li: {
                    component: 'li',
                    props: {
                      style: {
                        marginBottom: '10px',
                        display: 'block'
                      }
                    }
                  }
                },
                forceBlock: true
              }}
            >
              {msg}
            </Markdown>
          </motion.div>
          <div
            style={{
              display: isHasErrorMessage ? 'flex' : 'none'
            }}
            className='flex items-center gap-1 text-primary-red'
            onClick={handleResend}
          >
            <span>
              <InfoCircle size={14} />
            </span>
            <p className='text-xs'>Lỗi mạng, bấm để thử lại</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(MessageItem)
