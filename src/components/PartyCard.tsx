import { Party } from '../types'

interface Props {
  party: Party
  onEdit: () => void
  onDelete: () => void
}

export default function PartyCard({ party, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-800 truncate">{party.name}</p>
        <p className="text-sm text-gray-500 truncate">{party.address}</p>
      </div>
      <div className="flex gap-2 ml-3 shrink-0">
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          編輯
        </button>
        <button
          onClick={onDelete}
          className="text-sm text-red-500 hover:text-red-700"
        >
          刪除
        </button>
      </div>
    </div>
  )
}
