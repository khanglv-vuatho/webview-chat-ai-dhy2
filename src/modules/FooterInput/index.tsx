import { motion } from 'framer-motion'
import IndustryItem from '../IndustryItem'
import { Button, Textarea } from '@nextui-org/react'
import { Send2 } from 'iconsax-react'
import { ChangeEvent, memo, useEffect, useRef } from 'react'
import { Message, TClearData } from '@/types'

type FooterInputType = {
  conversation: Message[]
  isBotResponding: boolean
  message: string
  handleChangeValue: (value: ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: () => void
  isDisabled: boolean
  clearData: TClearData | null
}

const FooterInput: React.FC<FooterInputType> = ({ message, handleChangeValue, handleSendMessage, isDisabled, clearData }) => {
  const sendRef: any = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    handleSendMessage()
  }

  useEffect(() => {
    const inputEl: any = inputRef.current

    const handleBlur = (e: any) => {
      if (!sendRef?.current.contains(e.relatedTarget)) {
        inputRef?.current?.blur()
      } else {
        inputEl.focus() // Focus lại vào input nếu không phải click vào sendRef
      }
    }

    inputEl?.addEventListener('blur', handleBlur)

    return () => {
      inputEl?.removeEventListener('blur', handleBlur)
    }
  }, [sendRef, inputRef, message])

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.5 }} className='sticky bottom-0 left-0 right-0 flex flex-col gap-2'>
      {clearData?.isClear ? (
        <div className='p-4'>
          <IndustryItem
            accurate_percent={clearData?.accurate_percent}
            currency_symbol={clearData?.currency_symbol}
            problem={clearData?.translated_summarizeProblem}
            range={clearData?.range}
            workname={clearData?.translated_workerName}
          />
        </div>
      ) : (
        <div className='pt-2'>
          <p className='px-10 text-center text-xs font-light text-primary-gray'>Vua Thợ AI có thể gây ra nhầm lẫn. Vua Thợ sẽ cố gắng hoàn thiện hơn.</p>
          <div className='flex items-end gap-2'>
            <Textarea
              minRows={1}
              maxRows={3}
              autoFocus
              ref={inputRef}
              value={message}
              onChange={handleChangeValue}
              radius='none'
              placeholder='Nhập tin nhắn'
              endContent={
                <Button ref={sendRef} isIconOnly isDisabled={isDisabled} radius='full' className='flex items-center justify-center bg-transparent' onClick={handleSend}>
                  <Send2 variant='Bold' className={`${!isDisabled ? 'text-primary-yellow' : 'text-primary-gray'} transition`} />
                </Button>
              }
              classNames={{
                base: 'px-4',
                innerWrapper: 'items-end',
                input: 'text-sm text-primary-base placeholder:pl-1 pb-1',
                inputWrapper:
                  'p-1 !min-h-14 border-none bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus-visible=true]:ring-0 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-0 group-data-[focus-visible=true]:ring-offset-background shadow-none'
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default memo(FooterInput)
