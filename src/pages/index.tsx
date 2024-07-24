import ImageFallback from '@/components/ImageFallback'
import RenderAILoading from '@/components/RenderAILoading'
import AILoading from '@/modules/AILoading'
import Conversation from '@/modules/Conversation'
import ConverstaionsSkeleton from '@/modules/ConversationsSkeleton'
import FooterInput from '@/modules/FooterInput'
import Header from '@/modules/Header'
import TypewriterEffect from '@/modules/TypewriterEffect'
import instance from '@/services/axiosConfig'
import { Message, TAllMessage, TClearData, TServiceToProblem } from '@/types'
import { formatDataPostMessage } from '@/utils'
import { CircularProgress } from '@nextui-org/react'
import { ChangeEvent, RefObject, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const words = 'Xin chào! Hãy cho tôi biết bạn đang cần người thợ như thế nào?'

const Home = () => {
  const queryParams = new URLSearchParams(location.search)
  const tokenUrl = queryParams.get('token')
  const lang = queryParams.get('lang') || 'vi'
  const serviceId = queryParams.get('serviceId')
  const problem = queryParams.get('problem')
  const isHasProblem = problem !== null

  const tokenRedux = useSelector((state: any) => state.token)
  const token = tokenUrl || tokenRedux

  const [isLoadingAI, setIsLoadingAI] = useState(true)
  const [isBotResponding, setIsBotResponding] = useState(false)
  const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState(false)
  const [isAnimateMessage, setIsAnimateMessage] = useState(false)
  const [message, setMessage] = useState(isHasProblem ? problem : '')
  const [messageApi, setMessageApi] = useState(isHasProblem ? problem : '')
  const [isFirstSendMessage, setIsFirstSendMessage] = useState(true)

  const [conversation, setConversation] = useState<Message[]>([])
  const [onSendingMessage, setOnSendingMessage] = useState(false)
  const [onFetchingInitChat, setOnFetchingInitChat] = useState(false)
  const [onProblemToService, setOnProblemToService] = useState(false)

  const [problemToService, setProblemToService] = useState<TServiceToProblem | null>(null)

  const [onDeteleting, setOnDeteleting] = useState(false)

  const [clearData, setClearData] = useState<TClearData | null>(null)

  const isFristSendMessageAndHasProblem = isFirstSendMessage && isHasProblem

  const [dataInitMessage, setDataInitMessage] = useState<TAllMessage>({
    data: [],
    clear_data: null,
    created_at: ''
  })

  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    //maxLenght 500 characters
    if (e.target.value.length > 500) return
    setMessage(e.target.value)
    setMessageApi(e.target.value)
  }

  const handleSendMessage = () => {
    if (message.length === 0) return
    setOnSendingMessage(true)
    setIsAnimateMessage(true)

    const newConversation: Message = {
      by_me: true,
      content: messageApi.trim(),
      isDisable: true,
      type: 'text'
    }

    const botConversation: Message = {
      by_me: false,
      content: '...',
      type: 'text',
      isDisable: true
    }

    // Thêm newConversation trước
    setConversation((prevConversation) => [...prevConversation, newConversation])

    // Sau 0.2 giây thêm botConversation
    const timer = setTimeout(() => {
      setConversation((prevConversation) => [...prevConversation, botConversation])
    }, 200)

    if (inputRef.current) {
      inputRef?.current?.focus()
    }

    //clear timeout
    return () => clearTimeout(timer)
  }

  const handleReset = useCallback(() => {
    setOnDeteleting(true)
  }, [])

  const handleTimeEnd = useCallback(() => {
    setIsLoadingAI(false)
  }, [])

  const handleSendMessageApi = async () => {
    try {
      const payload = {
        content: isFristSendMessageAndHasProblem ? '' : messageApi.trim(),
        id: dataInitMessage?.id,
        service_id: serviceId
      }

      if (!isFristSendMessageAndHasProblem) {
        setMessage('')
        setMessageApi('')
      }

      setIsBotResponding(true)
      setIsFirstSendMessage(false)

      const response = await fetch(import.meta.env.VITE_API_URL + '/webview/extract-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + `${token}`,
          'Accept-Language': lang
        },
        body: JSON.stringify(payload)
      })

      if (!response.body) {
        throw new Error('ReadableStream not yet supported in this browser.')
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

      let accumulatedContent = ''
      let tempContent = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          const extractJSON = (input: string) => {
            const regex = /\[{(.*?)\}\]/s
            const match = input.match(regex)
            return match ? match[0] : null
          }

          const content: any = JSON?.parse?.(extractJSON?.(tempContent) || '')

          if (content?.[0]?.isClear) {
            setClearData(content?.[0])
            setConversation((prev) => {
              const data = prev.map((item) => {
                if (item.content === '...') {
                  item.content = content?.[0]?.message
                  return item
                }
                return item
              })
              return [...data]
            })
          }

          setIsBotResponding(false)
          setOnProblemToService(true)

          break
        }
        // streaming data
        const lines = value?.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6))
              if (jsonData.content) {
                accumulatedContent += jsonData.content
                tempContent += jsonData.content
                setConversation((prevConversation) => {
                  // if has `[` add  content = '...' to render UI
                  const index = accumulatedContent.indexOf('[')
                  //khi text cắt ra mà không có content
                  const text = accumulatedContent.substring(0, index).toString() == '' ? '...' : accumulatedContent.substring(0, index).toString()
                  if (index !== -1) {
                    // setIsAnimationClearData(true)
                  }
                  const result = index !== -1 ? text : accumulatedContent

                  let newConversation: Message = {
                    by_me: false,
                    content: result.replace(`\n\n`, ''),
                    isDisable: true,
                    type: 'text'
                  }

                  if (prevConversation.length > 0 && !prevConversation[prevConversation.length - 1].by_me) {
                    const updatedConversation = [...prevConversation]
                    updatedConversation[updatedConversation.length - 1] = newConversation
                    return updatedConversation
                  }

                  return [...prevConversation, newConversation]
                })
              }
            } catch (error) {
              console.error('JSON parse error:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setOnSendingMessage(false)
      setIsBotResponding(false)
      setIsAnimateMessage(false)
    }
  }

  const handleFetchingInitDataOfChating = async () => {
    try {
      const { data }: any = await instance.get('/webview/extract-problem')
      setDataInitMessage(data)

      if (data?.clear_data) {
        setClearData(data.clear_data?.[0])
        setOnProblemToService(true)

        setConversation(() => {
          const botMessage: Message = {
            by_me: false,
            content: data.clear_data?.[0]?.message,
            isDisable: true,
            type: 'text'
          }

          return [...data.data, botMessage]
        })
      } else {
        setConversation(data.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setOnFetchingInitChat(false)
    }
  }

  //handle call api delete history
  const handleDeleteChatHistory = async () => {
    try {
      await instance.post('/webview/new-extract-problem')
    } catch (error) {
      console.log(error)
    } finally {
      //handle reset state chat
      setConversation([])
      if (!isFristSendMessageAndHasProblem) {
        setMessage('')
        setMessageApi('')
      }
      setClearData(null)
      setOnDeteleting(false)
      setIsOpenModalConfirmDelete(false)
      setIsBotResponding(false)
    }
  }

  const handleSendingProblemToService = async () => {
    if (!clearData) return
    try {
      const payload = {
        problem: clearData?.englishOriginal
      }
      const { data } = await instance.post('/webview/problem-to-service', payload)
      setProblemToService(data)
    } catch (error) {
      console.log(error)
    } finally {
      setOnProblemToService(false)
    }
  }

  // fetch init data to use conversation
  useEffect(() => {
    onFetchingInitChat && handleFetchingInitDataOfChating()
  }, [onFetchingInitChat])

  //handle send message
  useEffect(() => {
    onSendingMessage && handleSendMessageApi()
  }, [onSendingMessage])

  //handle clear data message
  useEffect(() => {
    onDeteleting && handleDeleteChatHistory()
  }, [onDeteleting])

  useEffect(() => {
    if (serviceId || problem) {
      setOnSendingMessage(true)
      setOnDeteleting(true)
    } else {
      setOnFetchingInitChat(true)
    }
  }, [])

  useEffect(() => {
    onProblemToService && handleSendingProblemToService()
  }, [onProblemToService])

  useEffect(() => {
    const data = formatDataPostMessage({ dataInput: clearData, serviceIdApi: problemToService?.id })
    console.log({ data })
  }, [clearData, problemToService])

  return (
    <div className={`relative flex h-dvh ${isLoadingAI ? 'overflow-hidden' : 'overflow-auto'} flex-col`}>
      <Header
        isDisable={isBotResponding}
        handleReset={handleReset}
        conversation={conversation}
        onDeteleting={onDeteleting}
        setIsOpenModalConfirmDelete={setIsOpenModalConfirmDelete}
        isOpenModalConfirmDelete={isOpenModalConfirmDelete}
      />

      <div className={`flex flex-1 flex-col gap-2 overflow-auto py-4`}>
        {isLoadingAI ? (
          <Suspense
            fallback={
              <div className='flex h-dvh w-full items-center justify-center'>
                <CircularProgress
                  classNames={{
                    svg: 'h-8 w-8 text-primary-blue'
                  }}
                />
              </div>
            }
          >
            <AILoading handleTimeEnd={handleTimeEnd} />
          </Suspense>
        ) : onFetchingInitChat ? (
          <ConverstaionsSkeleton />
        ) : conversation?.length > 0 ? (
          <Conversation isAnimateMessage={isAnimateMessage} conversation={conversation} />
        ) : (
          <div className='mx-auto flex max-w-[258px] flex-col items-center gap-2'>
            <div className='mx-auto h-12 w-16'>
              <ImageFallback src='/robot.png' className='size-full' />
            </div>
            <div className='text-center text-sm'>
              <TypewriterEffect words={words} />
            </div>
          </div>
        )}
      </div>
      <FooterInput
        conversation={conversation}
        isBotResponding={isBotResponding}
        message={message}
        handleChangeValue={handleChangeValue}
        handleSendMessage={handleSendMessage}
        isDisabled={isBotResponding || !message.length}
        clearData={clearData}
        isAnimationClearData={onProblemToService}
      />
    </div>
  )
}

export default Home
