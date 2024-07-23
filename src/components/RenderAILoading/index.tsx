import lottie from 'lottie-web'
import { memo, useEffect, useRef } from 'react'

import animationJson from '@/lotties/ai-generating.json'

type Props = { className?: string }
const RenderAILoading = ({ className }: Props) => {
  return <AnimateAIGenerating className={className} />
}

const AnimateAIGenerating = ({ className }: Props) => {
  const container = useRef(null)
  useEffect(() => {
    const instance = lottie.loadAnimation({
      container: container.current!,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationJson,
      rendererSettings: {
        className: 'w-full'
      }
    })

    instance.setSpeed(10)

    return () => instance.destroy()
  }, [])

  return <div ref={container} className={className} />
}

export default memo(RenderAILoading)
