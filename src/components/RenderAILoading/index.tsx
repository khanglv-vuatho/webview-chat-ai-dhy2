'use client'

import lottie from 'lottie-web'
import { memo, useEffect, useRef } from 'react'

import animationJson from '@/JSONAnimation/ai-generating.json'

const RenderAILoading = () => {
  return <AnimateAIGenerating />
}
const AnimateAIGenerating = () => {
  const container = useRef(null)
  useEffect(() => {
    const instance = lottie.loadAnimation({
      container: container.current!,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationJson
    })

    instance.setSpeed(6)

    return () => instance.destroy()
  }, [])

  return <div ref={container} />
}

export default memo(RenderAILoading)
