import * as React from 'react'
import { Commit } from '../../models/commit'
import { GitHubRepository } from '../../models/github-repository'
import { getAvatarUsersForCommit } from '../../models/avatar'
import { formatDate } from '../../lib/format-date'

interface ICommitHoverInfoProps {
  readonly commit: Commit
  readonly gitHubRepository: GitHubRepository | null
}

export class CommitHoverInfo extends React.Component<ICommitHoverInfoProps> {
  public render() {
    const { commit, gitHubRepository } = this.props
    const avatarUsers = getAvatarUsersForCommit(gitHubRepository, commit)
    const author = avatarUsers[0] // Primary author

    const dateStr = formatDate(commit.author.date, {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    return (
      <div
        className="commit-hover-info"
        style={{ padding: '12px', maxWidth: '320px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {author?.name || 'Unknown'}
            </div>
            <div
              style={{
                fontSize: '12px',
                opacity: 0.7,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {author?.email || ''}
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: '12px',
            fontSize: '13px',
            lineHeight: '1.4',
            fontWeight: 500,
          }}
        >
          {commit.summary}
        </div>

        <div
          style={{
            fontSize: '11px',
            opacity: 0.8,
            borderTop: '1px solid var(--box-border-color, #e1e4e8)',
            paddingTop: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontWeight: 600 }}>Commit:</span>
            <span
              style={{
                fontFamily: 'var(--font-family-monospace)',
                userSelect: 'text',
              }}
            >
              {commit.sha}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Date:</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </div>
    )
  }
}
