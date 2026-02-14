import { Party, PartyType } from '../types'
import PartyCard from './PartyCard'

interface Props {
  title: string
  parties: Party[]
  type: PartyType
  onAdd: (type: PartyType) => void
  onEdit: (type: PartyType, party: Party) => void
  onDelete: (type: PartyType, id: string) => void
}

export default function PartySection({ title, parties, type, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <button
          onClick={() => onAdd(type)}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          + 新增
        </button>
      </div>

      {parties.length === 0 ? (
        <p className="text-gray-400 text-sm py-2">尚未新增{title}</p>
      ) : (
        <div className="space-y-2">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              onEdit={() => onEdit(type, party)}
              onDelete={() => onDelete(type, party.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
