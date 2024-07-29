import { ButtonOnlyIcon, PrimaryButton, PrimaryOutlineButton } from '@/components/Buttons'
import ImageFallback from '@/components/ImageFallback'
import { DefaultModal } from '@/components/Modal'
import { keyPossmessage } from '@/constants'
import { Message } from '@/types'
import { postMessageCustom } from '@/utils'
import { motion } from 'framer-motion'
import { ArrowLeft2, Refresh2 } from 'iconsax-react'
import { memo, useCallback, useMemo, useState } from 'react'
import { Skeleton } from '@nextui-org/react'
import { useTranslation } from '@/context/translationProvider'

type HeaderProps = {
  handleReset: () => void
  conversation: Message[]
  onDeteleting: boolean
  isOpenModalConfirmDelete: boolean
  setIsOpenModalConfirmDelete: (value: boolean) => void
  isDisableRefresh: boolean
}

const Header: React.FC<HeaderProps> = ({ handleReset, conversation, onDeteleting, isOpenModalConfirmDelete, setIsOpenModalConfirmDelete, isDisableRefresh }) => {
  const { t } = useTranslation()
  const h = t('Header')

  const [isDisableButton, setIsDisableButton] = useState(false)

  const queryParams = new URLSearchParams(location.search)
  const serviceName = queryParams.get('serviceName')

  const isHasMessage = useMemo(() => {
    return conversation.length > 0
  }, [conversation])

  const handleClick = useCallback(() => {
    if (!isHasMessage) return
    setIsOpenModalConfirmDelete(true)
  }, [conversation])

  const handleCancle = useCallback(() => {
    setIsOpenModalConfirmDelete(false)
  }, [])

  const handleCloseWebview = () => {
    setIsDisableButton(true)
    postMessageCustom({
      message: keyPossmessage.CAN_POP
    })
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2, ease: 'easeInOut' }}
        className='sticky left-0 right-0 top-0 z-50 flex items-center justify-between bg-white p-4'
        style={{ zIndex: 10 }}
      >
        <ButtonOnlyIcon isDisabled={isDisableButton} onClick={handleCloseWebview} className='outline-none data-[focus-visible=true]:outline-none data-[focus-visible=true]:outline-offset-0'>
          <ArrowLeft2 />
        </ButtonOnlyIcon>
        <p className='justify-between text-center text-base font-bold'>{serviceName ? serviceName : 'AI Vua thợ'} </p>
        <ButtonOnlyIcon
          isDisabled={isDisableRefresh}
          className={`outline-none data-[focus-visible=true]:outline-none data-[focus-visible=true]:outline-offset-0 ${isHasMessage ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleClick}
        >
          <Refresh2 className='text-primary-yellow' />
        </ButtonOnlyIcon>
      </motion.header>
      <DefaultModal isOpen={isOpenModalConfirmDelete} onOpenChange={() => {}}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <div className='mx-auto w-[120px]'>
              <ImageFallback src='/robot.png' className='size-full' height={400} width={400} />
            </div>
            <p>{h?.text1}</p>
          </div>
          <div className='text-center'>{h?.text2}</div>
          <div className='flex items-center gap-4'>
            <PrimaryOutlineButton className='h-12 rounded-full' onClick={handleCancle}>
              {h?.text3}
            </PrimaryOutlineButton>
            <PrimaryButton isLoading={onDeteleting} className='h-12 rounded-full' onClick={handleReset}>
              {h?.text1}
            </PrimaryButton>
          </div>
        </div>
      </DefaultModal>
    </>
  )
}

export default memo(Header)

export const SkeletonHeader = memo(() => {
  return (
    <div className='sticky left-0 right-0 top-0 z-50 flex items-center justify-between bg-white p-4'>
      <Skeleton className='size-10 rounded-full' />
      <Skeleton className='h-[24px] w-[100px] rounded-lg' />
      <Skeleton className='size-10 rounded-full' />
    </div>
  )
})
