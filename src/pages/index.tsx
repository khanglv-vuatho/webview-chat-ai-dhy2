import ImageFallback from '@/components/ImageFallback'
import ToastComponent from '@/components/ToastComponent'
import AILoading from '@/modules/AILoading'
import Conversation from '@/modules/Conversation'
import FooterInput from '@/modules/FooterInput'
import Header from '@/modules/Header'
import TypewriterEffect from '@/modules/TypewriterEffect'
import instance from '@/services/axiosConfig'
import { Message, TAllMessage, TClearData, TConversation } from '@/types'
import { ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const words = 'Xin chào! Hãy cho tôi biết bạn đang cần người thợ như thế nào?'

const Home = () => {
  const queryParams = new URLSearchParams(location.search)
  const tokenUrl = queryParams.get('token')
  const lang = queryParams.get('lang') || 'vi'

  const tokenRedux = useSelector((state: any) => state.token)
  const token = tokenUrl || tokenRedux

  const [isLoadingAI, setIsLoadingAI] = useState(true)
  const [isBotResponding, setIsBotResponding] = useState(false)
  const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState(false)
  const [isAnimateMessage, setIsAnimateMessage] = useState(false)
  const [message, setMessage] = useState('')

  const [conversation, setConversation] = useState<Message[]>([])
  const [onDeteleting, setOnDeteleting] = useState(false)

  const [onSendingMessage, setOnSendingMessage] = useState(false)
  const [onFetchingInitChat, setOnFetchingInitChat] = useState(false)
  const [clearData, setClearData] = useState<TClearData | null>(null)

  const [dataInitMessage, setDataInitMessage] = useState<TAllMessage>({
    data: [],
    clear_data: null,
    created_at: ''
  })
  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)

  const isDisabled = message.trim() === '' || isBotResponding

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setMessage(e.target.value)
  }

  const handleSendMessage = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // if (isDisabled) return
    if (message.length === 0) return
    e?.preventDefault()
    setIsBotResponding(true)
    setOnSendingMessage(true)

    setConversation((prevConversation) => {
      const newConversation: Message = {
        by_me: true,
        content: message,
        isDisable: true,
        type: 'text'
      }
      return [...prevConversation, newConversation]
    })

    inputRef?.current?.focus()
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
        content: message,
        id: dataInitMessage?.id,
        service_id: null
      }

      setMessage('')

      const response = await fetch('https://local-sandbox-api-v1.vuatho.com/v1' + '/webview/extract-problem', {
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

      let accumulatedContent = '' // Initialize an empty string to accumulate the content

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          ToastComponent({ message: 'Stream has finished', type: 'success' })
          // xử lí logic ở chỗ này
          console.log('Stream has finished.')
          try {
            const parsedContent = JSON.parse(accumulatedContent.replace(`\n\n`, ''))

            if (Array.isArray(parsedContent) && parsedContent[0].isClear) {
              setConversation((prevConversation) => {
                //delete content = '...'
                const itemIsClear = parsedContent.find((item) => item.isClear)
                if (!itemIsClear) return prevConversation
                console.log({ itemIsClear })
                setClearData(itemIsClear)

                const newConversation = prevConversation.filter((conversation) => !(conversation.content === '...'))

                return [
                  ...newConversation,
                  {
                    by_me: false,
                    content: itemIsClear?.translated_summarizeProblem,
                    isDisable: true,
                    type: 'text'
                  }
                ]
              })
            }
          } catch (error) {
            console.error('JSON parse error:', error)
          }
          break
        }

        const lines = value?.split('\n')
        ToastComponent({ message: '123', type: 'success' })

        // Split the chunk by newline to process each line
        for (const line of lines) {
          ToastComponent({ message: '456', type: 'success' })

          if (line.startsWith('data: ')) {
            ToastComponent({ message: '789', type: 'success' })

            try {
              const jsonData = JSON.parse(line.substring(6)) // Parse JSON data
              if (jsonData.content) {
                accumulatedContent += jsonData.content // Accumulate the content

                if (accumulatedContent.replace(`\n\n`, '').startsWith(`[`)) {
                  console.log('......--------........')
                }
                // Check if the accumulated content is long enough

                // Update the state with the new content
                setConversation((prevConversation) => {
                  // if has `[` add  content = '...' to render UI
                  let newConversation: Message = {
                    by_me: false,
                    content: accumulatedContent.replace(`\n\n`, '').includes(`[`) ? '...' : accumulatedContent.replace(`\n\n`, ''),
                    isDisable: true,
                    type: 'text'
                  }

                  // Kiểm tra nếu cuộc trò chuyện trước đó có ít nhất một tin nhắn và tin nhắn cuối cùng không phải từ AI
                  if (prevConversation.length > 0 && !prevConversation[prevConversation.length - 1].by_me) {
                    // Tạo một bản sao của mảng trước đó để không làm thay đổi trực tiếp
                    const updatedConversation = [...prevConversation]

                    // if (prevConversation[prevConversation.length - 1]?.content.startsWith(`[{`)) {
                    //   console.log('adsadsadsads')
                    //   newConversation = { ...newConversation, content: '' }
                    // }

                    // Thay đổi nội dung của tin nhắn cuối cùng trong mảng updatedConversation thành tin nhắn mới nhất từ AI
                    updatedConversation[updatedConversation.length - 1] = newConversation

                    // Trả về mảng đã được cập nhật
                    return updatedConversation
                  }
                  //
                  console.log({ accumulatedContent })
                  // Nếu không có tin nhắn từ AI hoặc không có tin nhắn nào trong cuộc trò chuyện trước đó, thêm tin nhắn mới vào cuối mảng
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
    }
  }
  useEffect(() => {
    ToastComponent({ message: 'VITE_API_URL' + import.meta.env.VITE_API_URL, type: 'success' })
  }, [])
  const handleFetchingInitDataOfChating = async () => {
    try {
      const { data }: any = await instance.get('/webview/extract-problem')

      setDataInitMessage(data)

      setConversation(data.data)

      if (data.clear_data) {
        setClearData(data?.clear_data?.[0])
      }
    } catch (error) {
      console.log(error)
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
      setMessage('')
      setClearData(null)

      setOnDeteleting(false)
      setIsOpenModalConfirmDelete(false)
      setIsBotResponding(false)
    }
  }

  // fetch init data to use conversation
  useEffect(() => {
    onFetchingInitChat && handleFetchingInitDataOfChating()
  }, [onFetchingInitChat])

  useEffect(() => {
    setOnFetchingInitChat(true)
  }, [])

  //handle send message
  useEffect(() => {
    onSendingMessage && handleSendMessageApi()
  }, [onSendingMessage])

  //handle clear data message
  useEffect(() => {
    onDeteleting && handleDeleteChatHistory()
  }, [onDeteleting])

  return (
    <div className={`relative flex h-dvh ${isLoadingAI ? 'overflow-hidden' : 'overflow-auto'} flex-col`}>
      <Header
        handleReset={handleReset}
        conversation={conversation}
        onDeteleting={onDeteleting}
        setIsOpenModalConfirmDelete={setIsOpenModalConfirmDelete}
        isOpenModalConfirmDelete={isOpenModalConfirmDelete}
      />

      <div className={`flex flex-1 flex-col gap-2 overflow-auto py-4`}>
        {isLoadingAI ? (
          <AILoading handleTimeEnd={handleTimeEnd} />
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
        isDisabled={isDisabled}
        clearData={clearData}
      />
    </div>
  )
}

export default Home
