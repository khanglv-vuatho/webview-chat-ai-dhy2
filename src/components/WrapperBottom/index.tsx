import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

type WrapperBottomProps = {
  children: React.ReactNode
  className?: string
}

const WrapperBottom: React.FC<WrapperBottomProps> = ({ children, className }) => {
  return <div className={twMerge('fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 bg-white px-8 pb-6 pt-4', className)}>{children}</div>
}

export default memo(WrapperBottom)
