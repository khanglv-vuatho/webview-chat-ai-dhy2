import { Button, ButtonProps } from '@nextui-org/react'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  className?: string
  children: React.ReactNode
} & ButtonProps

const ButtonOnlyIcon = memo(({ className, children, ...props }: Props) => {
  return (
    <Button {...props} isIconOnly className={twMerge('w-fit rounded-full bg-transparent outline-none data-[focus-visible=true]:outline-none data-[focus-visible=true]:outline-offset-0', className)}>
      {children}
    </Button>
  )
})

export { ButtonOnlyIcon }
