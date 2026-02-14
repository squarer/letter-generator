interface Props {
  content: string
  onChange: (value: string) => void
}

export default function ContentEditor({ content, onChange }: Props) {
  const charCount = content.length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">信函內文</h2>
        <span className="text-sm text-gray-400">{charCount} 字</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full border border-gray-300 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="請輸入存證信函內文..."
      />

      <p className="text-xs text-gray-400 mt-2">
        每頁 20 字 × 10 行，共 200 字。超過將自動換頁。
      </p>
    </div>
  )
}
