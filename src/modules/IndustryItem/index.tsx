import { PrimaryButton } from '@/components/Buttons'
import { memo, useState } from 'react'

type IndustryItemProps = {
  workname: string
  range: number[]
  problem: string
  currency_symbol: string
  accurate_percent: number
}
const IndustryItem: React.FC<IndustryItemProps> = ({ workname, range, problem, currency_symbol, accurate_percent }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className='z-50 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[16px_16px_32px_0px_#C1C1C129]'>
      <p className='font-bold'>{workname}</p>
      <div className='flex flex-col'>
        <p className='text-sm'>Giá kham khảo</p>
        <p className='font-semibold text-primary-yellow'>
          {range?.[0]} - {range?.[1]}
          {currency_symbol}
        </p>
        <p className='text-primary-green'>{accurate_percent}% đúng giá thị trường</p>
      </div>
      <p className='text-sm'>{problem}</p>
      <PrimaryButton className='h-12 rounded-full font-bold' isLoading={isLoading} onClick={() => setIsLoading(true)}>
        Tìm thợ
      </PrimaryButton>
    </div>
  )
}

export default memo(IndustryItem)
