import { motion } from 'framer-motion'
import IndustryItem from '../IndustryItem'
import { Button, Input, Skeleton, Textarea } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { Send2 } from 'iconsax-react'
import { ChangeEvent, memo, useEffect, useRef, useState } from 'react'
import { Message, TClearData, TServiceToProblem } from '@/types'

type FooterInputType = {
  conversation: Message[]
  message: string
  handleChangeValue: (value: ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: () => void
  isDisabled: boolean
  clearData: TClearData | null
  isAnimationClearData: boolean
  problemToService: TServiceToProblem | null
  handleClearConversation: () => void
}

const FooterInput: React.FC<FooterInputType> = ({ message, handleChangeValue, handleSendMessage, isDisabled, clearData, isAnimationClearData, problemToService, handleClearConversation }) => {
  const sendRef: any = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { register, handleSubmit, watch } = useForm()

  const dataIsClear = clearData?.isClear

  const handleSend = () => {
    handleSendMessage()
  }

  useEffect(() => {
    const inputEl: any = inputRef.current
    let timeoutId: NodeJS.Timeout | null = null
    const handleBlur = (e: any) => {
      if (sendRef?.current?.contains(e?.relatedTarget)) {
        inputEl.focus()
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length) // Đặt con trỏ tại cuối văn bản

        // Thêm một khoảng trắng vào cuối văn bản
        if (inputEl) {
          inputEl.value += ' '
          // Cập nhật giá trị để React nhận diện thay đổi
          handleChangeValue({ target: inputEl } as ChangeEvent<HTMLInputElement>)

          timeoutId = setTimeout(() => {
            if (inputEl) {
              // Xóa ký tự cuối cùng (bao gồm khoảng trắng)
              inputEl.value = inputEl.value.slice(0, -2) // Xóa khoảng trắng và ký tự
              handleChangeValue({ target: inputEl } as ChangeEvent<HTMLInputElement>)
            }
          }, 0)
        }
      } else {
        inputEl?.blur()
      }
    }

    inputEl?.addEventListener('blur', handleBlur)

    return () => {
      timeoutId && clearTimeout(timeoutId)
      inputEl?.removeEventListener('blur', handleBlur)
    }
  }, [message])

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.2, ease: 'easeInOut' }}
      className='sticky bottom-0 left-0 right-0 flex flex-col gap-2'
    >
      {isAnimationClearData || dataIsClear ? (
        <div className='p-4'>
          <IndustryItem handleClearConversation={handleClearConversation} clear_data={clearData} isAnimationClearData={isAnimationClearData} problemToService={problemToService} />
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
              maxLength={500}
              value={message}
              onChange={handleChangeValue}
              radius='none'
              placeholder='Nhập tin nhắn'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              endContent={
                <Button ref={sendRef} isIconOnly isDisabled={isDisabled} radius='full' className='flex items-center justify-center bg-transparent' onClick={handleSend}>
                  <Send2 variant='Bold' className={`${!isDisabled ? 'text-primary-yellow' : 'text-primary-gray'} transition`} />
                </Button>
              }
              classNames={{
                base: 'px-4',
                innerWrapper: 'items-end',
                input: 'text-primary-base placeholder:pl-1 pb-1 caret-primary-yellow placeholder:text-base text-base',
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

export default FooterInput

export const SkeletonFooterInput = memo(() => {
  return (
    <div className='sticky bottom-0 left-0 right-0 flex flex-col gap-2 p-4'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-[40px] w-full rounded-lg' />
        <Skeleton className='flex size-10 flex-shrink-0 rounded-full' />
      </div>
    </div>
  )
})
