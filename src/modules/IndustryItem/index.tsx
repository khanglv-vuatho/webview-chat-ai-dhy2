import { PrimaryButton } from '@/components/Buttons'

import { TClearData } from '@/types'
import { capitalizeWords, postMessageCustom } from '@/utils'
import { lazy, memo, Suspense, useState } from 'react'

const RenderAILoading = lazy(() => import('@/components/RenderAILoading'))

type IndustryItemProps = {
  clear_data: TClearData | null
  isAnimationClearData: boolean
}
const IndustryItem: React.FC<IndustryItemProps> = ({ clear_data, isAnimationClearData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleFindWoker = () => {
    postMessageCustom({ message: 'findWorker', data: clear_data })
    setIsLoading(true)
  }

  return (
    <div className='z-50 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[16px_16px_32px_0px_#C1C1C129]'>
      <p className='font-bold'>{capitalizeWords(clear_data?.translated_workerName || '')}</p>
      <div className='flex flex-col'>
        <p className='text-sm'>Giá kham khảo</p>
        <p className='font-semibold text-primary-yellow'>
          {clear_data?.range?.[0].toLocaleString('en-US')} - {clear_data?.range?.[1].toLocaleString('en-US')}
          {clear_data?.currency_symbol}
        </p>
        <p className='text-primary-green'>{clear_data?.accurate_percent}% đúng giá thị trường</p>
      </div>
      <>
        {isAnimationClearData ? (
          <Suspense fallback={null}>
            <RenderAILoading />
          </Suspense>
        ) : (
          <>
            <p className='text-sm'>{clear_data?.translated_summarizeProblem}</p>
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
