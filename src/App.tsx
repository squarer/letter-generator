import { useState, useCallback } from 'react'
import { Party, LetterData, PartyType } from './types'
import PartySection from './components/PartySection'
import PartyModal from './components/PartyModal'
import ContentEditor from './components/ContentEditor'
import { generateDocx } from './lib/generateDocx'

function createId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export default function App() {
  const [senders, setSenders] = useState<Party[]>([])
  const [recipients, setRecipients] = useState<Party[]>([])
  const [ccRecipients, setCcRecipients] = useState<Party[]>([])
  const [content, setContent] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<PartyType>('sender')
  const [editingParty, setEditingParty] = useState<Party | null>(null)

  const [generating, setGenerating] = useState(false)

  const getSetterForType = useCallback(
    (type: PartyType) => {
      switch (type) {
        case 'sender':
          return setSenders
        case 'recipient':
          return setRecipients
        case 'cc':
          return setCcRecipients
      }
    },
    [],
  )

  const handleAdd = (type: PartyType) => {
    setModalType(type)
    setEditingParty(null)
    setModalOpen(true)
  }

  const handleEdit = (type: PartyType, party: Party) => {
    setModalType(type)
    setEditingParty(party)
    setModalOpen(true)
  }

  const handleDelete = (type: PartyType, id: string) => {
    const setter = getSetterForType(type)
    setter((prev) => prev.filter((p) => p.id !== id))
  }

  const handleModalConfirm = (name: string, address: string) => {
    const setter = getSetterForType(modalType)

    if (editingParty) {
      setter((prev) =>
        prev.map((p) => (p.id === editingParty.id ? { ...p, name, address } : p)),
      )
    } else {
      setter((prev) => [...prev, { id: createId(), name, address }])
    }

    setModalOpen(false)
  }

  const handleClearAll = () => {
    setSenders([])
    setRecipients([])
    setCcRecipients([])
    setContent('')
  }

  const handleGenerate = async () => {
    if (senders.length === 0 || recipients.length === 0) {
      alert('請至少填寫一位寄件人和一位收件人')
      return
    }
    if (!content.trim()) {
      alert('請填寫信函內文')
      return
    }

    setGenerating(true)
    try {
      const data: LetterData = { senders, recipients, ccRecipients, content }
      const buffer = await generateDocx(data)

      if (window.electronAPI) {
        const result = await window.electronAPI.saveDocx({
          buffer,
          defaultFileName: '存證信函.docx',
        })
        if (result.success) {
          alert(`檔案已儲存至：${result.filePath}`)
        } else if (result.error !== 'cancelled') {
          alert(`儲存失敗：${result.error}`)
        }
      } else {
        // Browser fallback: download directly
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '存證信函.docx'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      alert(`產生文件失敗：${err}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          存證信函產生器
        </h1>

        <div className="space-y-6">
          <PartySection
            title="寄件人"
            parties={senders}
            type="sender"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <PartySection
            title="收件人"
            parties={recipients}
            type="recipient"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <PartySection
            title="副本收件人"
            parties={ccRecipients}
            type="cc"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <ContentEditor content={content} onChange={setContent} />

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleClearAll}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              全部清除
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? '產生中...' : '產生文件'}
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <PartyModal
          type={modalType}
          party={editingParty}
          onConfirm={handleModalConfirm}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
