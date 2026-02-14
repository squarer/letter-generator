import { useState, useEffect } from 'react'
import { Party, PartyType } from '../types'

interface Props {
  type: PartyType
  party: Party | null
  onConfirm: (name: string, address: string) => void
  onCancel: () => void
}

const typeLabels: Record<PartyType, string> = {
  sender: '寄件人',
  recipient: '收件人',
  cc: '副本收件人',
}

export default function PartyModal({ type, party, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (party) {
      setName(party.name)
      setAddress(party.address)
    } else {
      setName('')
      setAddress('')
    }
  }, [party])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) {
      alert('請填寫姓名和地址')
      return
    }
    onConfirm(name.trim(), address.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {party ? '編輯' : '新增'}{typeLabels[type]}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入姓名"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入地址"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              確認
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
