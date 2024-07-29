import { PrimaryButton } from '@/components/Buttons'

import { TClearData, TServiceToProblem } from '@/types'
import { capitalizeWords, formatDataPostMessage, postMessageCustom } from '@/utils'
import { useState } from 'react'
import TypewriterEffect from '../TypewriterEffect'
import RenderAILoading from '@/components/RenderAILoading'

type IndustryItemProps = {
  clear_data: TClearData | null
  isAnimationClearData: boolean
  problemToService: TServiceToProblem | null
  handleClearConversation: () => void
  isTimeoutApiProblemToService: boolean
  setOnProblemToService: (value: boolean) => void
}

const IndustryItem: React.FC<IndustryItemProps> = ({ clear_data, isTimeoutApiProblemToService, isAnimationClearData, problemToService, handleClearConversation, setOnProblemToService }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleFindWoker = () => {
    const postMessage = formatDataPostMessage({ dataInput: clear_data, serviceIdApi: problemToService?.id })
    postMessageCustom(postMessage)
    handleClearConversation()
    setIsLoading(true)
  }

  const handleTryAgainProblemToService = () => {
    setOnProblemToService(true)
    setIsLoading(false)
  }

  return (
    <div className='z-50 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0px_8px_32px_0px_#00000014]'>
      {!problemToService?.id && !isAnimationClearData && !isTimeoutApiProblemToService && (
        <div className='rounded-lg border border-primary-yellow bg-primary-yellow/5 p-2 text-xs'>
          <div className='text-center'>
            Hiện tại tôi chưa tìm thấy Thợ này xung quanh bạn.
            <br />
            Vui lòng thử lại sau.
          </div>
        </div>
      )}
      <p className='font-bold'>
        <TypewriterEffect words={capitalizeWords(clear_data?.translated_workerName || '')} />
      </p>
      <div className='flex flex-col'>
        <p className='text-sm'>Giá kham khảo</p>
        <p className='font-semibold text-primary-yellow'>
          <TypewriterEffect words={clear_data?.range?.[0].toLocaleString('en-US').toString() || ''} /> - <TypewriterEffect words={clear_data?.range?.[1].toLocaleString('en-US').toString() || ''} />
          {clear_data?.currency_symbol}
        </p>
        <p className='text-primary-green'>{clear_data?.accurate_percent}% đúng giá thị trường</p>
      </div>
      <>
        {isAnimationClearData ? (
          <div className='flex h-[110px]'>
            <RenderAILoading className='left-[-16px] top-[-100px] h-[100px] w-[calc(100%+32px)]' />
          </div>
        ) : isTimeoutApiProblemToService ? (
          <p className='text-xs text-primary-red'>
            Kết nối mạng không ổn đỉnh.{' '}
            <span className='text-primary-yellow underline' onClick={handleTryAgainProblemToService}>
              Thử lại
            </span>
          </p>
        ) : (
          <>
            <p className='text-sm'>
              <TypewriterEffect words={clear_data?.translated_summarizeProblem.toString() || ''} />
            </p>
            {problemToService?.id !== null && !isAnimationClearData && (
              <PrimaryButton className='h-12 rounded-full font-bold text-primary-black' isLoading={isLoading} onClick={handleFindWoker}>
                Tìm thợ
              </PrimaryButton>
            )}
          </>
        )}
      </>
    </div>
  )
}

export default IndustryItem
