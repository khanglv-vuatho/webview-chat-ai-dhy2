import { PrimaryButton } from '@/components/Buttons'

import { TClearData, TServiceToProblem } from '@/types'
import { capitalizeWords, formatDataPostMessage, postMessageCustom } from '@/utils'
import { memo, useState } from 'react'
import TypewriterEffect from '../TypewriterEffect'
import RenderAILoading from '@/components/RenderAILoading'
import { useTranslation } from '@/context/translationProvider'
type IndustryItemProps = {
  clear_data: TClearData | null
  isAnimationClearData: boolean
  problemToService: TServiceToProblem | null
  isTimeoutApiProblemToService: boolean
  setOnProblemToService: (value: boolean) => void
  onDeteleting: boolean
}

const IndustryItem: React.FC<IndustryItemProps> = ({ clear_data, isTimeoutApiProblemToService, isAnimationClearData, problemToService, setOnProblemToService, onDeteleting }) => {
  const { t } = useTranslation()
  const i = t('IndustryItem')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFindWoker = () => {
    setIsLoading(true)
    const postMessage = formatDataPostMessage({ dataInput: clear_data, serviceIdApi: problemToService?.id })
    postMessageCustom(postMessage)
  }

  const handleTryAgainProblemToService = () => {
    setOnProblemToService(true)
  }

  return (
    <div className='z-50 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0px_8px_32px_0px_#00000014]'>
      {!problemToService?.id && !isAnimationClearData && !isTimeoutApiProblemToService && (
        <div className='rounded-lg border border-primary-yellow bg-primary-yellow/5 p-2 text-xs'>
          <div className='text-center'>
            {i?.text1}
            <br />
            {i?.text2}
          </div>
        </div>
      )}
      <p className='font-bold'>
        <TypewriterEffect words={capitalizeWords(clear_data?.translated_workerName || '')} />
      </p>
      <div className='flex flex-col'>
        <p className='text-sm'> {i?.text3}</p>
        <p className='font-semibold text-primary-yellow'>
          <TypewriterEffect words={clear_data?.range?.[0].toLocaleString('en-US').toString() || ''} /> - <TypewriterEffect words={clear_data?.range?.[1].toLocaleString('en-US').toString() || ''} />
          {clear_data?.currency_symbol}
        </p>
        <p className='text-primary-green'>
          {clear_data?.accurate_percent}% {i?.text4}
        </p>
      </div>
      <>
        {isAnimationClearData ? (
          <div className='flex h-[110px]'>
            <RenderAILoading className='left-[-16px] top-[-100px] h-[100px] w-[calc(100%+32px)]' />
          </div>
        ) : isTimeoutApiProblemToService ? (
          <p className='text-xs text-primary-gray'>
            {i?.text5}{' '}
            <span className='text-primary-yellow underline' onClick={handleTryAgainProblemToService}>
              {i?.text6}
            </span>
          </p>
        ) : (
          <>
            <p className='text-sm'>
              <TypewriterEffect words={clear_data?.translated_summarizeProblem.toString() || ''} />
            </p>
            {problemToService?.id !== null && !isAnimationClearData && (
              <PrimaryButton className='h-12 rounded-full font-bold text-primary-black' isLoading={onDeteleting || isLoading} onClick={handleFindWoker}>
                {i?.text7}
              </PrimaryButton>
            )}
          </>
        )}
      </>
    </div>
  )
}

export default memo(IndustryItem)
