import ToastComponent from '@/components/ToastComponent'
import { TClearData } from '@/types'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'

const useUnfocusItem = (callback: () => void, exclusionRef?: React.RefObject<HTMLElement | null>): React.RefObject<any> => {
  const itemRef = useRef<any>(null)

  useEffect(() => {
    const handleBlur = (event: Event) => {
      const clickedOutside = itemRef.current && !itemRef.current.contains(event.target as Node)

      const clickedOnExclusion = exclusionRef && exclusionRef.current && exclusionRef.current.contains(event.target as Node)

      if (clickedOutside && !clickedOnExclusion) {
        callback()
      }
    }

    document.addEventListener('click', handleBlur)

    return () => {
      document.removeEventListener('click', handleBlur)
    }
  }, [callback, exclusionRef])

  return itemRef
}

function capitalizeWords(string: string) {
  if (!string) return ''
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler: any = useRef(null)

  useEffect(() => {
    // Clear the timeout if value changes (cleanup function)
    if (handler.current) {
      clearTimeout(handler.current)
    }

    // Set the timeout to update debouncedValue after the specified delay
    handler.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function to clear timeout if component unmounts or value changes
    return () => {
      if (handler.current) {
        clearTimeout(handler.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

const handleAddLangInUrl = ({ mainUrl, lang, token }: { mainUrl: string; lang: string; token: string }) => {
  return `${mainUrl}?lang=${lang}&token=${token}`
}

const formatLocalTime = (time: string) => {
  const utcMoment = moment.utc(time, 'HH:mm:ss')
  const localTime = utcMoment.local().format('HH:mm:ss')
  return localTime
}

const formatDDMMYYYY = (time: string) => {
  return moment(time).format('DD/MM/YYYY')
}

const postMessageCustom = ({ message, data = {} }: { message: string; data?: any }) => {
  //@ts-ignore
  if (window?.vuatho) {
    //@ts-ignore
    window?.vuatho?.postMessage(
      JSON.stringify({
        message,
        data
      })
    )
  } else {
    ToastComponent({ message: message || 'has bug here', type: 'error' })
  }
}
type TFormatDataPostMessage = {
  dataInput: TClearData | null
  serviceIdApi?: number
}

const formatDataPostMessage = ({ dataInput, serviceIdApi }: TFormatDataPostMessage) => {
  const queryParams = new URLSearchParams(location.search)
  const serviceId = queryParams.get('serviceId')
  const isFromUserBookingForm = queryParams.get('isFromUserBookingForm')

  if (!dataInput) return

  let result = {
    message: '',
    data: {}
  }

  // { serviceId, translatedWorkerName, translatedSummarizeProblem, currencySymbol, rangePrice }
  // {data
  // :
  // {serviceId: 12, translatedWorkerName: 'Thợ cắt tóc', translatedSummarizeProblem: 'Bạn cần thợ cắt tóc nam.', currencySymbol: 'VND', rangePrice: Array(2)}
  // message
  // :
  // "aiResponse"}

  const dataClean = {
    translatedWorkerName: dataInput?.translated_workerName,
    translatedSummarizeProblem: dataInput?.translated_summarizeProblem,
    currencySymbol: dataInput?.currency_symbol,
    rangePrice: dataInput?.range
  }

  if (!serviceId && !isFromUserBookingForm) {
    if (!serviceIdApi) return
    result = {
      message: 'aiResponse',
      data: {
        serviceId: serviceIdApi,
        ...dataClean
      }
    }
  } else if (!!isFromUserBookingForm) {
    //{translatedSummarizeProblem, currencySymbol, rangePrice}
    const cloneDataClean: any = { ...dataClean }
    delete cloneDataClean.translatedWorkerName
    result = {
      message: 'aiResponseForBookingForm',
      data: {
        ...cloneDataClean
      }
    }
  } else if (serviceId != null && isFromUserBookingForm == null) {
    //{serviceId, translatedWorkerName, translatedSummarizeProblem, currencySymbol, rangePrice}
    result = {
      message: 'aiResponseForSpecificService',
      data: {
        serviceId,
        ...dataClean
      }
    }
  }

  return result
}

export { useUnfocusItem, capitalizeWords, useDebounce, handleAddLangInUrl, formatLocalTime, formatDDMMYYYY, postMessageCustom, formatDataPostMessage }
