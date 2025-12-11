import { Commit } from '../../models/commit'

export interface IGraphLink {
  readonly startColumn: number
  readonly endColumn: number
  readonly color: string
  readonly isMerge: boolean
}

export interface IGraphRow {
  readonly commitColumn: number
  readonly commitColor: string
  readonly links: ReadonlyArray<IGraphLink>
  // Columns that have a line passing through this row (active branches not touching this commit)
  readonly passThrough: ReadonlyArray<{ column: number; color: string }>
  // Whether this commit has children (i.e. is connected to the row above)
  readonly hasChildren: boolean
  // The maximum column index used in this row (for width calculation)
  readonly maxColumn: number
}

const COLORS = [
  '#17a2b8', // cyan
  '#28a745', // green
  '#ffc107', // yellow
  '#dc3545', // red
  '#6f42c1', // purple
  '#e83e8c', // pink
  '#fd7e14', // orange
  '#20c997', // teal
  '#007bff', // blue
  '#6610f2', // indigo
]

export function calculateGraph(
  commits: ReadonlyArray<Commit>
): ReadonlyArray<IGraphRow> {
  const rows: IGraphRow[] = []
  const columns: (string | null)[] = []
  const columnColors: (string | null)[] = []

  let nextColorIndex = 0

  for (const commit of commits) {
    let columnIndex = columns.indexOf(commit.sha)

    if (columnIndex === -1) {
      // Commit not found in columns (new tip)
      columnIndex = columns.indexOf(null)
      if (columnIndex === -1) {
        columnIndex = columns.length
        columns.push(null)
        columnColors.push(null)
      }
    }

    // Assign color if not present
    if (!columnColors[columnIndex]) {
      columnColors[columnIndex] = COLORS[nextColorIndex % COLORS.length]
      nextColorIndex++
    }

    // Identify pass-through columns (active columns that are not the current commit)
    const passThrough: { column: number; color: string }[] = []
    for (let i = 0; i < columns.length; i++) {
      if (i !== columnIndex && columns[i] !== null) {
        passThrough.push({ column: i, color: columnColors[i]! })
      }
    }

    // If the commit was found in columns, it means a child pointed to it.
    // If it was not found (newly allocated), it's a tip (no children in this graph context).
    // Note: This assumes we process from child to parent.
    const hasChildren =
      columnIndex < columns.length && columns[columnIndex] === commit.sha

    const color = columnColors[columnIndex]!
    const links: IGraphLink[] = []

    const parentSHAs = commit.parentSHAs

    // We need to determine the state of columns *after* this commit
    // But we also need to draw links *to* the parents.

    // Current commit consumes the slot at `columnIndex`.
    // It will be replaced by `parentSHAs[0]` (if exists).
    // Other parents will occupy other slots.

    // IMPORTANT: We must check if parents are already in columns to avoid duplicates.

    if (parentSHAs.length === 0) {
      columns[columnIndex] = null
      // We don't clear color immediately to avoid flickering if reused?
      // Actually better to clear it so next usage gets a new color.
      columnColors[columnIndex] = null
    } else {
      // First parent
      const firstParent = parentSHAs[0]
      // Check if first parent is already elsewhere (merge into existing branch?)
      // Usually first parent continues the branch.

      // If first parent is ALREADY in another column, we merge INTO it.
      const existingFirstParentIndex = columns.indexOf(firstParent)

      if (
        existingFirstParentIndex !== -1 &&
        existingFirstParentIndex !== columnIndex
      ) {
        // Merge into existing
        links.push({
          startColumn: columnIndex,
          endColumn: existingFirstParentIndex,
          color: color,
          isMerge: true,
        })
        columns[columnIndex] = null
        columnColors[columnIndex] = null
      } else {
        // Continue in same column
        columns[columnIndex] = firstParent
        links.push({
          startColumn: columnIndex,
          endColumn: columnIndex,
          color: color,
          isMerge: false,
        })
      }

      // Other parents
      for (let i = 1; i < parentSHAs.length; i++) {
        const parentSha = parentSHAs[i]
        let parentColumn = columns.indexOf(parentSha)

        if (parentColumn === -1) {
          // Find free slot
          parentColumn = columns.indexOf(null)
          if (parentColumn === -1) {
            parentColumn = columns.length
            columns.push(null)
            columnColors.push(null)
          }
          columns[parentColumn] = parentSha
          if (!columnColors[parentColumn]) {
            columnColors[parentColumn] = COLORS[nextColorIndex % COLORS.length]
            nextColorIndex++
          }
        }

        links.push({
          startColumn: columnIndex,
          endColumn: parentColumn,
          color: columnColors[parentColumn]!,
          isMerge: true,
        })
      }
    }

    rows.push({
      commitColumn: columnIndex,
      commitColor: color,
      links,
      passThrough,
      hasChildren,
      maxColumn: columns.length,
    })
  }

  return rows
}
