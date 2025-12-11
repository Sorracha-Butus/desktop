import * as React from 'react'
import { IGraphRow } from '../../lib/git/commit-graph'

const RowHeight = 50
const ColumnWidth = 15
const DotRadius = 4
const StrokeWidth = 2

interface ICommitGraphItemProps {
  readonly graphRow: IGraphRow
}

export class CommitGraphItem extends React.Component<ICommitGraphItemProps> {
  public render() {
    const { graphRow } = this.props
    const width = Math.max((graphRow.maxColumn + 1) * ColumnWidth, ColumnWidth)

    return (
      <svg
        width={width}
        height={RowHeight}
        className="commit-graph-item"
        style={{ marginRight: '10px', flexShrink: 0 }}
        aria-hidden="true"
      >
        {/* Pass-through lines */}
        {graphRow.passThrough.map(pt => (
          <line
            key={`pass-${pt.column}`}
            x1={pt.column * ColumnWidth + ColumnWidth / 2}
            y1={0}
            x2={pt.column * ColumnWidth + ColumnWidth / 2}
            y2={RowHeight}
            stroke={pt.color}
            strokeWidth={StrokeWidth}
          />
        ))}

        {/* Line from Top to Commit Node (if has children) */}
        {graphRow.hasChildren && (
          <line
            x1={graphRow.commitColumn * ColumnWidth + ColumnWidth / 2}
            y1={0}
            x2={graphRow.commitColumn * ColumnWidth + ColumnWidth / 2}
            y2={RowHeight / 2}
            stroke={graphRow.commitColor}
            strokeWidth={StrokeWidth}
          />
        )}

        {/* Links from this commit to parents */}
        {graphRow.links.map((link, i) => {
          const x1 = link.startColumn * ColumnWidth + ColumnWidth / 2
          const y1 = RowHeight / 2
          const x2 = link.endColumn * ColumnWidth + ColumnWidth / 2
          const y2 = RowHeight

          let d = ''
          if (link.startColumn === link.endColumn) {
            d = `M ${x1} ${y1} L ${x2} ${y2}`
          } else {
            // Bezier curve
            d = `M ${x1} ${y1} C ${x1} ${y2}, ${x2} ${y1}, ${x2} ${y2}`
          }

          return (
            <path
              key={`link-${i}`}
              d={d}
              stroke={link.color}
              strokeWidth={StrokeWidth}
              fill="none"
            />
          )
        })}

        <circle
          cx={graphRow.commitColumn * ColumnWidth + ColumnWidth / 2}
          cy={RowHeight / 2}
          r={DotRadius}
          fill={graphRow.commitColor}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    )
  }
}
