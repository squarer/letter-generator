export interface Party {
  id: string
  name: string
  address: string
}

export interface LetterData {
  senders: Party[]
  recipients: Party[]
  ccRecipients: Party[]
  content: string
}

export type PartyType = 'sender' | 'recipient' | 'cc'
