import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export type TConversation = {
  id: string
  message: string
  time: number
}

export type Message = {
  by_me: boolean
  content: string
  type: 'text' | 'image'
  isDisable: boolean
  id: number
}

type TEnglishOriginal = {
  industry: string
  workerName: string
  summarizeProblem: string
}

export type TClearData = {
  id: number
  type: string
  range: [number, number]
  isClear: boolean
  message: string
  currency_symbol: string
  englishOriginal: TEnglishOriginal
  accurate_percent: number
  translated_industry: string
  translated_workerName: string
  location_name_from_latlng: string
  translated_summarizeProblem: string
}

export type TServiceToProblem = {
  icon: string
  id: number
  isNew: boolean
  name: string
}

export type TAllMessage = {
  id?: number
  clear_data: null | TClearData
  created_at: string
  data: Message[]
}

export type TPostMessage = { message: string; data?: any }
