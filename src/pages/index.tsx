import { ChangeEvent, lazy, RefObject, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNetworkState } from '@uidotdev/usehooks'

import ImageFallback from '@/components/ImageFallback'
import ConverstaionsSkeleton from '@/modules/ConversationsSkeleton'
import TypewriterEffect from '@/modules/TypewriterEffect'
import instance from '@/services/axiosConfig'
import { Message, TAllMessage, TClearData, TServiceToProblem } from '@/types'

import { SkeletonHeader } from '@/modules/Header'
import { SkeletonFooterInput } from '@/modules/FooterInput'
import { handleToastNoNetwork } from '@/utils'
import { useTranslation } from '@/context/translationProvider'

const Header = lazy(() => import('@/modules/Header'))
const FooterInput = lazy(() => import('@/modules/FooterInput'))
const Conversation = lazy(() => import('@/modules/Conversation'))

type TPayload = {
  content: string
  id: number | undefined
  service_id: string | null
}

const Home = () => {
  const network = useNetworkState()
  const queryParams = new URLSearchParams(location.search)
  const tokenUrl = queryParams.get('token')
  const lang = queryParams.get('lang') || 'vi'
  const serviceId = queryParams.get('serviceId')
  const problem = queryParams.get('problem')
  const isHasProblem = problem !== null

  const { t } = useTranslation()
  const b = t('Body')

  const tokenRedux = useSelector((state: any) => state.token)
  const token = tokenUrl || tokenRedux

  // loading
  const [isBotResponding, setIsBotResponding] = useState(false)
  const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState(false)
  const [isAnimateMessage, setIsAnimateMessage] = useState(false)
  const [isTimeoutApiProblemToService, setIsTimeoutApiProblemToService] = useState(false)

  // input
  const [message, setMessage] = useState(isHasProblem ? problem : '')
  const [messageApi, setMessageApi] = useState(isHasProblem ? problem : '')
  const [isFirstSendMessage, setIsFirstSendMessage] = useState(true)

  // conversation
  const [conversation, setConversation] = useState<Message[]>([])
  const [onSendingMessage, setOnSendingMessage] = useState(false)
  const [onFetchingInitChat, setOnFetchingInitChat] = useState(false)
  const [onErrorWhenAIResponding, setOnErrorWhenAIResponding] = useState(false)

  const [hasErrorWhenAIResponding, setHasErrorWhenAIResponding] = useState(false)
  const [idMessageError, setIdMessageError] = useState<number | null>(null)

  // clear data
  const [clearData, setClearData] = useState<TClearData | null>(null)
  const [onProblemToService, setOnProblemToService] = useState(false)

  const [problemToService, setProblemToService] = useState<TServiceToProblem | null>(null)

  const [onDeteleting, setOnDeteleting] = useState(false)

  const isFristSendMessageAndHasProblem = isFirstSendMessage && isHasProblem

  const [dataInitMessage, setDataInitMessage] = useState<TAllMessage>({
    data: [],
    clear_data: null,
    created_at: ''
  })

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    //maxLenght 500 characters
    if (e.target.value.length > 150) return
    setMessage(e.target.value)
    setMessageApi(e.target.value)
  }

  const handleSendMessage = () => {
    if (!network.online) {
      handleToastNoNetwork()
      return
    }
    // if (message.length === 0) return
    setMessage('')
    setOnSendingMessage(true)
    setIsAnimateMessage(true)

    const newConversation: Message = {
      by_me: true,
      content: messageApi.trim(),
      isDisable: true,
      type: 'text',
      id: Date.now()
    }

    const botConversation: Message = {
      by_me: false,
      content: '...',
      type: 'text',
      isDisable: true,
      id: Date.now()
    }

    // Thêm newConversation trước
    setConversation((prevConversation) => [...prevConversation, newConversation])

    // Sau 0.2 giây thêm botConversation
    const timer = setTimeout(() => {
      setConversation((prevConversation) => [...prevConversation, botConversation])
    }, 200)

    //clear timeout
    return () => clearTimeout(timer)
  }

  const handleReset = useCallback(() => {
    setOnDeteleting(true)
  }, [])

  const handleCallApiMessage = async (payloadInput?: TPayload) => {
    const payload: TPayload = {
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

      body: JSON.stringify(payloadInput ? payloadInput : payload)
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
        if (tempContent === '') {
          setHasErrorWhenAIResponding(true)
        }

        const extractJSON = (input: string) => {
          const regex = /\[{(.*?)\}\]/s
          const match = input.match(regex)
          return match ? match[0] : null
        }

        try {
          const content: any = JSON?.parse?.(extractJSON?.(tempContent) || '')

          if (content?.[0]?.isClear) {
            setClearData(content?.[0])
            setConversation((prev) => {
              const data = prev?.map((item) => {
                if (item.content === '...') {
                  item.content = content?.[0]?.message
                  return item
                }
                return item
              })
              return [...data]
            })
          }
          setOnProblemToService(true)
        } catch (error) {
          console.log(error)
        }

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
                  if (accumulatedContent.substring(0, index).toString() === '') {
                    setHasErrorWhenAIResponding(true)
                  }
                  setOnProblemToService(true)
                }
                const result = index !== -1 ? text : accumulatedContent

                let newConversation: Message = {
                  by_me: false,
                  content: result.replace(`\n\n`, '').replace('```', '').replace('```', '').trim(),
                  isDisable: true,
                  type: 'text',
                  id: Date.now()
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
  }
  const handleSendMessageApi = async () => {
    try {
      await handleCallApiMessage()
    } catch (error) {
      setHasErrorWhenAIResponding(true)
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
      console.log({ data })
      setDataInitMessage(data)
      if (data?.clear_data) {
        // setClearData(data.clear_data?.[0])
        // setOnProblemToService(true)
        // setConversation(() => {
        //   const botMessage: Message = {
        //     by_me: false,
        //     content: data.clear_data?.[0]?.message,
        //     isDisable: true,
        //     type: 'text',
        //     id: Date.now()
        //   }
        //   return [...data.data, botMessage]
        // })
        await handleDeleteChatHistory()
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
      const { data } = await instance.post('/webview/new-extract-problem')
      setDataInitMessage(data)
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
      setOnProblemToService(false)
      if (problem || serviceId) {
        if (conversation.length === 0) {
          setConversation(() => {
            const placeholderMessage: Message = {
              by_me: false,
              content: '...',
              isDisable: true,
              type: 'text',
              id: Date.now()
            }
            return [placeholderMessage]
          })
        }
        setOnSendingMessage(true)
      }
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
      setIsTimeoutApiProblemToService(false)
    } catch (error) {
      console.log(error)
      setIsTimeoutApiProblemToService(true)
    } finally {
      setOnProblemToService(false)
    }
  }

  const handleRetryMessage = async () => {
    if (!network.online) {
      handleToastNoNetwork()
      return
    }

    setIdMessageError(null)

    const lastMessageByMe = conversation.filter((item) => item.by_me).slice(-1)[0]

    // Lấy tin nhắn cuối cùng bởi bot

    // Lấy tin nhắn cuối cùng trong cuộc trò chuyện
    const lastMessageInConversation = conversation.slice(-1)[0]

    if (lastMessageInConversation?.by_me) {
      // Không cần làm gì nếu tin nhắn cuối cùng là của tôi
    } else {
      // Thay đổi nội dung tin nhắn cuối cùng của bot thành "..."
      setConversation((prevConversation) => {
        const updatedConversation = [...prevConversation]
        const lastMessageByBotIndex = updatedConversation
          .slice()
          .reverse()
          .findIndex((item) => !item.by_me)
        if (lastMessageByBotIndex !== -1) {
          const indexToUpdate = updatedConversation.length - 1 - lastMessageByBotIndex
          updatedConversation[indexToUpdate] = {
            ...updatedConversation[indexToUpdate],
            content: '...'
          }
        }
        return updatedConversation
      })
    }
    try {
      const payload: TPayload = {
        content: lastMessageByMe?.content.trim() || '',
        id: dataInitMessage?.id,
        service_id: serviceId
      }
      await handleCallApiMessage(payload)
    } catch (error) {
      console.log(error)
    } finally {
      setOnErrorWhenAIResponding(false)
      setIsBotResponding(false)
    }
  }

  const handleResendMessage = () => {
    setOnErrorWhenAIResponding(true)
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
      setOnDeteleting(true)
    } else {
      setOnFetchingInitChat(true)
    }
  }, [])

  useEffect(() => {
    onProblemToService && handleSendingProblemToService()
  }, [onProblemToService, clearData])

  useEffect(() => {
    onErrorWhenAIResponding && handleRetryMessage()
  }, [onErrorWhenAIResponding])

  useEffect(() => {
    if (conversation.length === 0) return
    if (!network.online) {
      setIdMessageError(conversation.filter((item) => item.by_me).slice(-1)[0]?.id)
      setHasErrorWhenAIResponding(true)
    } else {
      setHasErrorWhenAIResponding(false)
      setIdMessageError(null)
    }
  }, [network])

  return (
    <div className={`relative flex h-dvh flex-col`}>
      <Suspense fallback={<SkeletonHeader />}>
        <Header
          isDisableRefresh={isBotResponding}
          handleReset={handleReset}
          conversation={conversation}
          onDeteleting={onDeteleting}
          setIsOpenModalConfirmDelete={setIsOpenModalConfirmDelete}
          isOpenModalConfirmDelete={isOpenModalConfirmDelete}
        />
      </Suspense>
      <div className={`flex flex-1 flex-col gap-2 overflow-auto py-4`}>
        <Suspense fallback={null}>
          {onFetchingInitChat ? (
            <ConverstaionsSkeleton />
          ) : conversation?.length > 0 ? (
            <Conversation
              handleResend={handleResendMessage}
              idMessageError={idMessageError}
              hasErrorWhenAIResponding={hasErrorWhenAIResponding}
              isAnimateMessage={isAnimateMessage}
              conversation={conversation}
              isBotResponding={isBotResponding}
            />
          ) : (
            <div className='mx-auto flex max-w-[258px] flex-col items-center gap-2'>
              <div className='mx-auto h-12 w-16'>
                <ImageFallback src='/robot.png' className='size-full' />
              </div>
              <div className='text-center text-sm'>
                <TypewriterEffect words={b?.text1} />
              </div>
            </div>
          )}
        </Suspense>
      </div>
      <Suspense fallback={<SkeletonFooterInput />}>
        <FooterInput
          conversation={conversation}
          message={message}
          handleChangeValue={handleChangeValue}
          handleSendMessage={handleSendMessage}
          isDisabled={isBotResponding || !message.length || !message.trim().length}
          clearData={clearData}
          isAnimationClearData={onProblemToService}
          problemToService={problemToService}
          setOnProblemToService={setOnProblemToService}
          onDeteleting={onDeteleting}
          isTimeoutApiProblemToService={isTimeoutApiProblemToService}
        />
      </Suspense>
    </div>
  )
}

export default Home
