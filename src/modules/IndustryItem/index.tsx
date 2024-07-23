import { PrimaryButton } from '@/components/Buttons'
import RenderAILoading from '@/components/RenderAILoading'

import { TClearData } from '@/types'
import { capitalizeWords, postMessageCustom } from '@/utils'
import { useState } from 'react'
import TypewriterEffect from '../TypewriterEffect'

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
          <div className='relative flex h-[84px]'>
            <RenderAILoading className='absolute left-[-16px] top-[-80px] w-[calc(100%+32px)]' />
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
