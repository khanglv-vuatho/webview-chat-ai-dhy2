import { Message, TClearData, TServiceToProblem } from '@/types'
import { Button, Skeleton, Textarea } from '@nextui-org/react'
import { motion } from 'framer-motion'
import { Send2 } from 'iconsax-react'
import { ChangeEvent, memo, useEffect, useRef } from 'react'
import IndustryItem from '../IndustryItem'
import { useTranslation } from '@/context/translationProvider'

type FooterInputType = {
  conversation: Message[]
  message: string
  handleChangeValue: (value: ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: () => void
  isDisabled: boolean
  clearData: TClearData | null
  isAnimationClearData: boolean
  problemToService: TServiceToProblem | null
  isTimeoutApiProblemToService: boolean
  setOnProblemToService: (value: boolean) => void
  onDeteleting: boolean
}

const FooterInput: React.FC<FooterInputType> = ({
  message,
  handleChangeValue,
  handleSendMessage,
  isDisabled,
  clearData,
  isAnimationClearData,
  problemToService,
  isTimeoutApiProblemToService,
  setOnProblemToService,
  onDeteleting
}) => {
  const { t } = useTranslation()
  const f = t('FooterInput')
  const sendRef: any = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const dataIsClear = clearData?.isClear

  const handleSend = () => {
    handleSendMessage()
  }

  useEffect(() => {
    const inputEl: any = inputRef.current

    const handleBlur = (e: any) => {
      if (sendRef?.current?.contains(e?.relatedTarget)) {
        inputEl?.focus()
        inputEl.value = ''
      } else {
        inputEl?.blur()
      }
    }

    inputEl?.addEventListener('blur', handleBlur)

    return () => {
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
          <IndustryItem
            isTimeoutApiProblemToService={isTimeoutApiProblemToService}
            clear_data={clearData}
            onDeteleting={onDeteleting}
            isAnimationClearData={isAnimationClearData}
            problemToService={problemToService}
            setOnProblemToService={setOnProblemToService}
          />
        </div>
      ) : (
        <div className='pt-2'>
          <p className='px-10 text-center text-xs font-light text-primary-gray'>{f?.text1}</p>
          <div className='flex items-end gap-2'>
            <Textarea
              minRows={1}
              maxRows={3}
              autoFocus
              ref={inputRef}
              maxLength={150}
              value={message}
              onChange={handleChangeValue}
              radius='none'
              placeholder={f?.text2}
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
