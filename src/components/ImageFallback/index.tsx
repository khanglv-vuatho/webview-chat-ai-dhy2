'use client'

import { Image, ImageProps } from '@nextui-org/react'
import { useState, forwardRef, Ref, memo } from 'react'
import { twMerge } from 'tailwind-merge'

interface ImageFallbackProps extends ImageProps {
  fallback?: string
}

const ImageFallback = forwardRef(({ src, alt, className, ...props }: ImageFallbackProps, ref: Ref<HTMLImageElement>) => {
  const [fallback, setFallback] = useState(src || '/robot.png')
  const _onError = () => {
    setFallback('/robot.png')
  }
  return <Image removeWrapper className={twMerge('pointer-events-none select-none rounded-none', className)} ref={ref} src={fallback} onError={_onError.bind(this)} alt={alt} {...props} />
})

export default memo(ImageFallback)
