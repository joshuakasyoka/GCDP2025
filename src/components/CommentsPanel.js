import React from 'react';
import { CommentCard } from './MapComments';

// ── CommentsPanel ──────────────────────────────────────────────────────────
// Right-hand slide-in panel with a Comments tab.
// Props:
//   open          - bool
//   onClose       - fn
//   comments      - array of comment objects
//   onUpdateComment - fn(id, patch)

function IconComment() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

function Avatar({ initials, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, minWidth: size, fontSize: size * 0.35,
      borderRadius: '50%', background: '#e5e7eb', color: '#6b7280',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function CommentsPanel({ open, onClose, comments = [], onUpdateComment, initialSelectedId, onClearInitialSelected }) {
  const [selectedId, setSelectedId] = React.useState(null);

  // When panel closes, reset selection
  React.useEffect(() => {
    if (!open) setSelectedId(null);
  }, [open]);

  // Jump to a specific comment when opened via "Open in panel"
  React.useEffect(() => {
    if (initialSelectedId && open) {
      setSelectedId(initialSelectedId);
      onClearInitialSelected?.();
    }
  }, [initialSelectedId, open, onClearInitialSelected]);

  const selectedComment = comments.find(c => c.id === selectedId);

  return (
    <div style={{
      width: open ? 340 : 0,
      minWidth: open ? 340 : 0,
      height: '100%',
      background: '#fff',
      borderLeft: '0.5px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      flexShrink: 0,
    }}>
      {open && (
        <>
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px',
            borderBottom: '0.5px solid #e5e5e5',
            flexShrink: 0,
          }}>
            <span style={{ color: '#6b7280', display: 'flex' }}><IconComment /></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', flex: 1, letterSpacing: '0.04em' }}>
              COMMENTS
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 4 }}>
              {comments.length}
            </span>
            <button
              onClick={onClose}
              style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
            >
              <IconClose />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedComment ? (
              /* Expanded comment view */
              <CommentCard
                panelMode
                title={selectedComment.title}
                status={selectedComment.status}
                coord={selectedComment.coord}
                initialComments={selectedComment.threadComments}
                activities={selectedComment.activities}
                onClose={() => setSelectedId(null)}
                onSetStatus={s => onUpdateComment?.(selectedComment.id, { status: s })}
                onReply={c => onUpdateComment?.(selectedComment.id, { threadComments: [...(selectedComment.threadComments || []), c], previewText: c.text })}
                onActivity={e => onUpdateComment?.(selectedComment.id, {
                  activities: [...(selectedComment.activities || []), e],
                })}
              />
            ) : comments.length === 0 ? (
              /* Empty state */
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ marginBottom: 12, opacity: 0.4 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, marginBottom: 4 }}>No comments yet</p>
                <p style={{ fontSize: 12 }}>Select the comment tool and click anywhere on the canvas to leave a comment.</p>
              </div>
            ) : (
              /* Comment feed */
              <div>
                {comments.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px',
                      borderBottom: '0.5px solid #f3f4f6',
                      background: 'none', border: 'none',
                      borderBottom: i < comments.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Avatar initials={c.initials ?? 'SP'} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                          {c.name ?? 'Samuel'}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                          {c.time}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {c.previewText || (c.threadComments?.[0]?.text) || 'New comment'}
                      </p>
                      {c.status && (
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, color: '#9ca3af' }}>
                          {c.status}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
