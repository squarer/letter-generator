import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeightRule,
  TableLayoutType,
  VerticalAlign,
  PageOrientation,
} from 'docx'
import { LetterData, Party } from '../types'

// ── 常數 ──────────────────────────────────────────────
const COLS = 20
const ROWS = 10

// A4 twips
const PAGE_W = 11906
const PAGE_H = 16838
const M_TOP = 567   // ~1cm
const M_BOT = 567
const M_LEFT = 680
const M_RIGHT = 680

const AREA_W = PAGE_W - M_LEFT - M_RIGHT // 可用寬度

const FONT = '標楷體'
const ROW_LABELS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

// 第一欄(行號)寬度、其餘 20 欄平分
const LABEL_COL_W = 480
const CELL_W = Math.floor((AREA_W - LABEL_COL_W) / COLS)
const GRID_W = LABEL_COL_W + CELL_W * COLS

const CELL_H = 454 // ~0.8cm row height

// ── 邊框 ──────────────────────────────────────────────
const B = { style: BorderStyle.SINGLE, size: 1, color: '000000' }
const BORDERS = { top: B, bottom: B, left: B, right: B }
// ── 工具函式 ──────────────────────────────────────────
function text(t: string, size = 20, bold = false): TextRun {
  return new TextRun({ text: t, font: FONT, size, bold })
}

function para(runs: TextRun[], align: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT, spacingAfter = 0): Paragraph {
  return new Paragraph({
    alignment: align,
    spacing: { before: 0, after: spacingAfter, line: 276 },
    children: runs,
  })
}

function cell(
  children: Paragraph[],
  width: number,
  borders = BORDERS,
  opts: {
    columnSpan?: number
    rowSpan?: number
    vAlign?: typeof VerticalAlign[keyof typeof VerticalAlign]
    shading?: { fill: string }
  } = {},
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verticalAlign: (opts.vAlign ?? VerticalAlign.CENTER) as any,
    columnSpan: opts.columnSpan,
    rowSpan: opts.rowSpan,
    shading: opts.shading,
    children,
  })
}

// ── 文字分行分頁 ─────────────────────────────────────
function splitToLines(content: string): string[][] {
  const lines: string[][] = []
  for (const p of content.split('\n')) {
    const chars = Array.from(p)
    if (chars.length === 0) {
      lines.push([])
    } else {
      for (let i = 0; i < chars.length; i += COLS) {
        lines.push(chars.slice(i, i + COLS))
      }
    }
  }
  return lines
}

function splitPages(lines: string[][]): string[][][] {
  const pages: string[][][] = []
  for (let i = 0; i < lines.length; i += ROWS) {
    pages.push(lines.slice(i, i + ROWS))
  }
  return pages.length ? pages : [[]]
}

// ── 標題區 ───────────────────────────────────────────
function makeTitle(): Paragraph {
  const chars = '郵 局 存 證 信 函 用 紙'
  return para([text(chars, 32, true)], AlignmentType.CENTER, 120)
}

// ── 表頭資訊區 ───────────────────────────────────────
function makeHeaderTable(data: LetterData): Table {
  // 用簡潔的多列 table 來模擬官方表頭
  // 左側: 副本/正本 + 存證信函第___號
  // 右側: 寄件人/收件人/副本收件人
  const totalW = GRID_W
  const leftW = Math.floor(totalW * 0.28)
  const rightW = totalW - leftW

  const rows: TableRow[] = []

  // 收集右側行
  const rightLines: Paragraph[] = []
  rightLines.push(para([text('〈寄件人如為機關、團體、學校、公司、商號請加蓋單位圖章及法定代理人簽名或蓋章〉', 14)], AlignmentType.LEFT))

  const addParty = (label: string, num: string, parties: Party[]) => {
    if (parties.length === 0) {
      rightLines.push(para([text(`${num}${label}`, 18)]))
      rightLines.push(para([text('　　姓名：', 18)]))
      rightLines.push(para([text('　　詳細地址：', 18)]))
    } else if (parties.length === 1) {
      rightLines.push(para([text(`${num}${label}`, 18)]))
      rightLines.push(para([text(`　　姓名：${parties[0].name}`, 18)]))
      rightLines.push(para([text(`　　詳細地址：${parties[0].address}`, 18)]))
    } else {
      rightLines.push(para([text(`${num}${label}`, 18)]))
      for (let i = 0; i < parties.length; i++) {
        rightLines.push(para([text(`　　姓名${i + 1}：${parties[i].name}`, 18)]))
        rightLines.push(para([text(`　　詳細地址：${parties[i].address}`, 18)]))
      }
    }
  }

  addParty('寄件人', '一、', data.senders)
  addParty('收件人', '二、', data.recipients)
  addParty('副本收件人', '三、', data.ccRecipients.length > 0 ? data.ccRecipients : [])
  rightLines.push(para([text('（本欄姓名、地址不敷填寫時，請另紙聯記）', 14)], AlignmentType.CENTER))

  // 左側內容
  const leftLines: Paragraph[] = [
    para([text('副　本', 18)], AlignmentType.CENTER),
    para([text('正　本', 18)], AlignmentType.CENTER),
    para([text('', 18)]),
    para([text('存證信函第', 18), text('　　　　', 18), text('號', 18)], AlignmentType.CENTER),
  ]

  // 加「郵局」在左側
  leftLines.splice(1, 0, para([text('郵　局', 22, true)], AlignmentType.CENTER))

  rows.push(
    new TableRow({
      children: [
        cell(leftLines, leftW, BORDERS, { vAlign: VerticalAlign.CENTER }),
        cell(rightLines, rightW, BORDERS, { vAlign: VerticalAlign.TOP }),
      ],
    }),
  )

  return new Table({
    rows,
    width: { size: totalW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [leftW, rightW],
  })
}

// ── 內文格網 ─────────────────────────────────────────
function makeGridTable(pageLines: string[][]): Table {
  const colWidths = [LABEL_COL_W, ...Array(COLS).fill(CELL_W)]

  // 欄號 header row: 格/行 | 1 | 2 | ... | 20
  const headerCells: TableCell[] = [
    cell(
      [
        para([text('格', 14)], AlignmentType.CENTER),
        para([text('行', 14)], AlignmentType.CENTER),
      ],
      LABEL_COL_W,
    ),
  ]
  for (let c = 1; c <= COLS; c++) {
    headerCells.push(
      cell([para([text(String(c), 14)], AlignmentType.CENTER)], CELL_W),
    )
  }
  const headerRow = new TableRow({
    height: { value: 340, rule: HeightRule.EXACT },
    children: headerCells,
  })

  // 內容 rows
  const dataRows: TableRow[] = []
  for (let r = 0; r < ROWS; r++) {
    const chars = r < pageLines.length ? pageLines[r] : []
    const cells: TableCell[] = [
      // 行號
      cell([para([text(ROW_LABELS[r], 18)], AlignmentType.CENTER)], LABEL_COL_W),
    ]
    for (let c = 0; c < COLS; c++) {
      const ch = c < chars.length ? chars[c] : ''
      cells.push(
        cell([para([text(ch, 24)], AlignmentType.CENTER)], CELL_W),
      )
    }
    dataRows.push(
      new TableRow({
        height: { value: CELL_H, rule: HeightRule.ATLEAST },
        children: cells,
      }),
    )
  }

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: GRID_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: colWidths,
  })
}

// ── 頁尾區 ───────────────────────────────────────────
function makeFooterTable(): Table {
  // 存證信函共__頁 等資訊
  const totalW = GRID_W
  const leftW = Math.floor(totalW * 0.72)
  const rightW = totalW - leftW

  const leftLines: Paragraph[] = [
    para([
      text(`本存證信函共　　　頁，正本　　　份，存證費　　　　元，`, 16),
    ]),
    para([
      text('　　　　　　　　　副本　　　份，存證費　　　　元，', 16),
    ]),
    para([
      text('　　　　　　　　　附件　　　張，存證費　　　　元，', 16),
    ]),
    para([
      text('　　　　　　　　　加具正本　份，存證費　　　　元，', 16),
    ]),
    para([
      text('　　　　　　　　　加具副本　份，存證費　　　　元，合計　　　　元。', 16),
    ]),
  ]

  const rightLines: Paragraph[] = [
    para([text('')]),
    para([text('')]),
    para([text('黏　　　貼', 20, true)], AlignmentType.CENTER),
  ]

  const row1 = new TableRow({
    children: [
      cell(leftLines, leftW, BORDERS),
      cell(rightLines, rightW, BORDERS, { vAlign: VerticalAlign.CENTER }),
    ],
  })

  // 第二排：經 年 月 日...
  const row2Left: Paragraph[] = [
    para([
      text('　經　　　郵局　正', 16),
    ]),
    para([
      text('　年　月　日證明副本內容完全相同', 16),
    ]),
  ]
  const row2Mid: Paragraph[] = [
    para([text('郵戳', 16)], AlignmentType.CENTER),
  ]
  const row2Right: Paragraph[] = [
    para([text('經辦員', 16)], AlignmentType.CENTER),
    para([text('主　管', 16)], AlignmentType.CENTER),
  ]

  const midW = Math.floor(totalW * 0.15)
  const r2LeftW = Math.floor(totalW * 0.45)
  const r2RightW = leftW - r2LeftW - midW
  const r2FarRightW = rightW

  const row2 = new TableRow({
    children: [
      cell(row2Left, r2LeftW, BORDERS),
      cell(row2Mid, midW, BORDERS, { vAlign: VerticalAlign.CENTER }),
      cell(row2Right, r2RightW, BORDERS, { vAlign: VerticalAlign.CENTER }),
      cell(
        [
          para([text('郵　票　或', 16)], AlignmentType.CENTER),
          para([text('郵　資　券', 16)], AlignmentType.CENTER),
        ],
        r2FarRightW,
        BORDERS,
        { vAlign: VerticalAlign.CENTER },
      ),
    ],
  })

  // 備註
  const noteLines: Paragraph[] = [
    para([text('一、存證信函需送交郵局辦理證明手續後始有效，自交寄之日起由郵局保存之', 14)]),
    para([text('　　副本，於三年期滿後銷燬之。', 14)]),
    para([text('二、在　頁　行第　格下塗改增刪　字', 14), text('　', 14), text('（如有修改應填註本欄並蓋用', 14)]),
    para([text('　　　　　　　　　　　　　　　　　　　寄件人印章，但塗改增刪）', 14)]),
    para([text('　　　　　　　　　　　　　　　　　　　每頁至多不得逾二十字。', 14)]),
    para([text('三、每件一式三份，用不脫色筆或打字機複寫，或書寫後複印、影印，每格限', 14)]),
    para([text('　　書一字，色澤明顯、字跡端正。', 14)]),
  ]

  const noteLeftW = Math.floor(totalW * 0.08)
  const noteMidW = totalW - noteLeftW - rightW

  const row3 = new TableRow({
    children: [
      cell(
        [para([text('備', 20, true)], AlignmentType.CENTER), para([text('')]), para([text('註', 20, true)], AlignmentType.CENTER)],
        noteLeftW,
        BORDERS,
        { vAlign: VerticalAlign.CENTER },
      ),
      cell(noteLines, noteMidW, BORDERS),
      cell(
        [para([text('處', 20, true)], AlignmentType.CENTER)],
        rightW,
        BORDERS,
        { vAlign: VerticalAlign.CENTER },
      ),
    ],
  })

  return new Table({
    rows: [row1, row2, row3],
    width: { size: totalW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  })
}

// ── 騎縫郵戳 ─────────────────────────────────────────
function makeStampRow(): Paragraph {
  return para(
    [text('　　　　　　（騎縫郵戳）　　　　　　　　　　　　　　（騎縫郵戳）', 16)],
    AlignmentType.CENTER,
    0,
  )
}

// ── Section 建構 ──────────────────────────────────────
function makeSection(
  children: (Paragraph | Table)[],
): {
  properties: Record<string, unknown>
  children: (Paragraph | Table)[]
} {
  return {
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H, orientation: PageOrientation.PORTRAIT },
        margin: { top: M_TOP, bottom: M_BOT, left: M_LEFT, right: M_RIGHT },
      },
    },
    children,
  }
}

// ── 主函式 ───────────────────────────────────────────
export async function generateDocx(data: LetterData): Promise<ArrayBuffer> {
  const lines = splitToLines(data.content)
  const pages = splitPages(lines)

  const sections: ReturnType<typeof makeSection>[] = []

  for (let i = 0; i < pages.length; i++) {
    const children: (Paragraph | Table)[] = []

    // 每頁都有完整的官方表頭
    children.push(makeTitle())
    children.push(makeHeaderTable(data))

    // 內文格網
    children.push(
      para([text('')], AlignmentType.LEFT, 40), // 間距
    )
    children.push(makeGridTable(pages[i]))

    // 頁尾
    children.push(makeFooterTable())

    // 騎縫郵戳
    children.push(makeStampRow())

    sections.push(makeSection(children))
  }

  const doc = new Document({ sections })
  const blob = await Packer.toBlob(doc)
  return blob.arrayBuffer()
}
