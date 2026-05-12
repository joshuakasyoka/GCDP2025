import React from 'react';

// ── helpers ────────────────────────────────────────────────────────────────

function makeActivity(action, boldWord) {
  return {
    id: Date.now().toString() + Math.random(),
    initials: 'SP',
    name: 'Samuel',
    action,
    boldWord,
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

const STATUS_COLORS = {
  High:        { bg: '#bbf7d0', text: '#15803d', dot: '#4ade80' },
  Medium:      { bg: '#fef9c3', text: '#a16207', dot: '#facc15' },
  Low:         { bg: '#dbeafe', text: '#1d4ed8', dot: '#60a5fa' },
  'In Review': { bg: '#f3e8ff', text: '#7c3aed', dot: '#a78bfa' },
};

// ── icons ──────────────────────────────────────────────────────────────────

function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}
function IconMore() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>;
}
function IconResolve() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
}
function IconCheck() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconCalendar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconCoords() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>;
}
function IconStatus() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}
function IconType() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>;
}
function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconSend() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
}
function IconPanelRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>;
}
function IconEmoji() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"/></svg>;
}
function IconBack() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 32 }) {
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

// ── StatusPill ─────────────────────────────────────────────────────────────

function StatusPill({ status, animated = false }) {
  if (!status) return null;
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.High;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text, borderRadius: 20,
      padding: '3px 10px 3px 6px', fontSize: 12, fontWeight: 600,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: c.dot,
        display: 'inline-block',
        ...(animated ? { animation: 'mc-pulse 1.4s ease-in-out infinite' } : {}),
      }} />
      {status}
    </span>
  );
}

// ── CommentCard ────────────────────────────────────────────────────────────

export function CommentCard({
  status,
  onSetStatus,
  onClose,
  coord,
  initialComments,
  activities: activitiesProp,
  onActivity,
  onOpenInPanel,
  onReply,
  panelMode = false,
  title,
}) {
  const [view, setView] = React.useState('thread');
  const [comments, setComments] = React.useState(initialComments ?? []);
  const [reply, setReply] = React.useState('');
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);
  const statusRef = React.useRef(null);

  // Info view state
  const [editing, setEditing] = React.useState(false);
  const [activeFieldId, setActiveFieldId] = React.useState(null);
  const [activeLabelId, setActiveLabelId] = React.useState(null);
  const [fieldValues, setFieldValues] = React.useState({});
  const [labelValues, setLabelValues] = React.useState({});

  const activities = activitiesProp ?? [];

  React.useEffect(() => {
    if (!statusMenuOpen) return;
    function handleClick(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [statusMenuOpen]);

  function sendReply() {
    if (!reply.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      initials: 'SP', name: 'Samuel',
      time: 'just now', text: reply.trim(),
    };
    setComments(p => [...p, newComment]);
    onActivity?.(makeActivity('added a comment'));
    onReply?.(newComment);
    setReply('');
  }

  const baseRows = [
    { id: 'date-created', icon: <IconCalendar />, label: 'Date Created', value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { id: 'coordinates',  icon: <IconCoords />,   label: 'Coordinates',  value: coord ?? '—' },
    { id: 'status',       icon: <IconStatus />,   label: 'Status',       value: status ?? 'High', isStatus: true },
    { id: 'type',         icon: <IconType />,     label: 'Type',         value: 'Comment' },
  ];

  const cardStyle = {
    background: '#fff',
    borderRadius: panelMode ? 0 : 12,
    boxShadow: panelMode ? 'none' : '0 4px 24px rgba(0,0,0,0.13)',
    border: panelMode ? 'none' : '1px solid #f3f4f6',
    width: panelMode ? '100%' : 320,
    overflow: 'visible',
    fontFamily: 'inherit',
  };

  const headerStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px',
    borderBottom: '1px solid #f3f4f6',
  };

  return (
    <>
      <style>{`
        @keyframes mc-pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          {(panelMode && view === 'thread') ? (
            <button onClick={onClose} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', marginLeft: -2 }} title="Back">
              <IconBack />
            </button>
          ) : view === 'info' ? (
            <button onClick={() => { setView('thread'); setEditing(false); setActiveFieldId(null); setActiveLabelId(null); }} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', marginLeft: -2 }}>
              <IconBack />
            </button>
          ) : null}

          {view === 'thread' ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginRight: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                {title ?? 'Comment'}
              </span>
              <div style={{ position: 'relative', flex: 1 }} ref={statusRef}>
                {status ? (
                  <button onClick={() => setStatusMenuOpen(!statusMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <StatusPill status={status} animated />
                  </button>
                ) : (
                  <button onClick={() => setStatusMenuOpen(!statusMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <IconPlus /><span>Status</span>
                  </button>
                )}
                {statusMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999, padding: '4px 0', minWidth: 120 }}>
                    {['High', 'Medium', 'Low', 'In Review', null].map(s => (
                      <button key={s ?? 'none'} onClick={() => { onSetStatus?.(s); setStatusMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        {s ? <StatusPill status={s} /> : <span style={{ color: '#9ca3af', fontSize: 12 }}>No status</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Resolve">
                <IconResolve />
              </button>
              <button onClick={() => { setView('info'); setEditing(true); }} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                <IconEdit />
              </button>
              {onOpenInPanel && (
                <button onClick={onOpenInPanel} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Open in side panel">
                  <IconPanelRight />
                </button>
              )}
            </>
          ) : (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', flex: 1 }}>Edit Info</span>
              <button onClick={() => { setView('thread'); setEditing(false); setActiveFieldId(null); setActiveLabelId(null); }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                <IconCheck />
              </button>
            </>
          )}

          {!panelMode && (
            <button onClick={onClose} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <IconClose />
            </button>
          )}
        </div>

        {/* Thread view */}
        {view === 'thread' && (
          <>
            {comments.length === 0 ? (
              <div style={{ padding: '20px 16px', color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>
                No comments yet. Be the first!
              </div>
            ) : (
              <div>
                {comments.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: i < comments.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <Avatar initials={c.initials} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.time}</span>
                        </div>
                        {c.emoji ? <IconEmoji /> : <button style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><IconMore /></button>}
                      </div>
                      <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af', lineHeight: 1.4 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid #f9fafb' }}>
              <Avatar initials="SP" size={28} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 9999, padding: '6px 12px' }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Reply"
                  style={{ flex: 1, fontSize: 13, background: 'transparent', outline: 'none', border: 'none', color: '#374151', minWidth: 0 }}
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim()}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: reply.trim() ? '#6b7280' : '#d1d5db',
                    border: 'none', cursor: reply.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  <IconSend />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Info view */}
        {view === 'info' && (
          <div style={{ borderTop: '1px solid #f3f4f6' }}>
            <div style={{ padding: '8px 16px' }}>
              {baseRows.map(row => {
                const isActive = editing && activeFieldId === row.id && !row.isStatus;
                const displayVal = fieldValues[row.id] !== undefined ? fieldValues[row.id] : row.value;
                return (
                  <div
                    key={row.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb', cursor: editing && !row.isStatus && !isActive ? 'text' : 'default' }}
                    onClick={() => editing && !row.isStatus && !isActive && setActiveFieldId(row.id)}
                  >
                    <span style={{ flexShrink: 0 }}>
                      {editing && isActive ? (
                        <button onClick={e => { e.stopPropagation(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>{row.icon}</span>
                      )}
                    </span>
                    {editing && activeLabelId === row.id ? (
                      <input autoFocus value={labelValues[row.id] ?? row.label} onChange={e => setLabelValues(p => ({ ...p, [row.id]: e.target.value }))} onBlur={() => setActiveLabelId(null)} onKeyDown={e => { if (e.key === 'Enter') setActiveLabelId(null); }} onClick={e => e.stopPropagation()} style={{ fontSize: 13, color: '#6b7280', width: 112, flexShrink: 0, background: '#f9fafb', borderRadius: 6, padding: '2px 8px', outline: 'none', border: '1px solid #d1d5db' }} />
                    ) : (
                      <span style={{ fontSize: 13, color: '#9ca3af', width: 112, flexShrink: 0, cursor: editing ? 'text' : 'default' }} onClick={e => { if (editing) { e.stopPropagation(); setActiveLabelId(row.id); setActiveFieldId(null); } }}>
                        {labelValues[row.id] ?? row.label}
                      </span>
                    )}
                    <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      {row.isStatus ? <StatusPill status={displayVal ?? 'High'} />
                        : isActive ? (
                          <input autoFocus value={displayVal} onChange={e => setFieldValues(p => ({ ...p, [row.id]: e.target.value }))} onBlur={() => setActiveFieldId(null)} onKeyDown={e => { if (e.key === 'Enter') setActiveFieldId(null); }} style={{ fontSize: 13, color: '#374151', fontWeight: 500, textAlign: 'right', background: '#f9fafb', borderRadius: 6, padding: '2px 8px', outline: 'none', border: '1px solid #d1d5db', width: 130 }} />
                        ) : (
                          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{displayVal}</span>
                        )}
                    </span>
                  </div>
                );
              })}
            </div>

            {activities.length > 0 && (
              <div style={{ padding: '16px', borderTop: '1px solid #f9fafb' }}>
                {activities.slice(0, 3).map((event, i, arr) => (
                  <div key={event.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {i < arr.length - 1 && <div style={{ position: 'absolute', left: 16, top: 32, width: 1, background: '#e5e7eb', height: 'calc(100% - 8px)' }} />}
                    <Avatar initials={event.initials} size={32} />
                    <div style={{ flex: 1, paddingBottom: 12 }}>
                      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{event.name}</span>{' '}
                        {event.action}
                        {event.boldWord && <> <span style={{ fontWeight: 600, color: '#374151' }}>{event.boldWord}</span></>}
                      </p>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── CommentMarker ──────────────────────────────────────────────────────────
// The pin that appears on the canvas at the comment location.

export function CommentMarker({ comment, onClick, isActive }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(comment.id); }}
      style={{
        position: 'absolute',
        left: comment.x,
        top: comment.y,
        transform: 'translate(-50%, -100%)',
        zIndex: isActive ? 2000 : 1500,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      title={comment.previewText || 'Comment'}
    >
      {/* Avatar bubble */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: isActive ? '#1f2937' : '#374151',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        border: '2px solid #fff',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}>
        {comment.initials ?? 'SP'}
      </div>
      {/* Pointer triangle */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: `7px solid ${isActive ? '#1f2937' : '#374151'}`,
        marginTop: -1,
      }} />
    </div>
  );
}

export { makeActivity };
