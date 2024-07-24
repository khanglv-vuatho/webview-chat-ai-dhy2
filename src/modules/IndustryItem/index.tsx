import { PrimaryButton } from '@/components/Buttons'

import { TClearData, TServiceToProblem } from '@/types'
import { capitalizeWords, formatDataPostMessage, postMessageCustom } from '@/utils'
import { lazy, Suspense, useState } from 'react'
import TypewriterEffect from '../TypewriterEffect'

const RenderAILoading = lazy(() => import('@/components/RenderAILoading'))

type IndustryItemProps = {
  clear_data: TClearData | null
  isAnimationClearData: boolean
  problemToService: TServiceToProblem | null
}
const IndustryItem: React.FC<IndustryItemProps> = ({ clear_data, isAnimationClearData, problemToService }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleFindWoker = () => {
    const postMessage = formatDataPostMessage({ dataInput: clear_data, serviceIdApi: problemToService?.id })
    postMessageCustom(postMessage)

    setIsLoading(true)
  }

  return (
    <div className='z-50 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0px_8px_32px_0px_#00000014]'>
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
            <Suspense fallback={null}>
              <RenderAILoading className='left-[-16px] top-[-100px] h-[100px] w-[calc(100%+32px)]' />
            </Suspense>
          </div>
        ) : (
          <>
            <p className='text-sm'>
              <TypewriterEffect words={clear_data?.translated_summarizeProblem.toString() || ''} />
            </p>
            <PrimaryButton className='h-12 rounded-full font-bold text-primary-black' isLoading={isLoading} onClick={handleFindWoker}>
              Tìm thợ
            </PrimaryButton>
          </>
        )}
      </>
    </div>
  )
}

export default IndustryItem
