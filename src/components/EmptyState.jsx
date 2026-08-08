import React from 'react'
import { Upload, Disc } from 'lucide-react'

export default function EmptyState({ onUpload }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
    }}>
      {/* Animated disc */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Disc size={42} color="var(--text-muted)" />
        </div>
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '1px dashed var(--border)',
        }} />
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32, letterSpacing: 3,
        color: 'var(--text-primary)',
        marginBottom: 10,
      }}>
        No Rounds Yet
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>
        Upload your first score card photo to get started. Claude will automatically parse the scores and build the tournament standings.
      </p>

      {onUpload ? (
        <>
          <button
            onClick={onUpload}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-season)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#0d0f1a',
              padding: '12px 28px',
              fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 0 24px var(--accent-season-dim)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Upload size={16} />
            Upload Round 1
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
            Supports JPG, PNG — any clear photo of a score card
          </p>
        </>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          No rounds have been recorded for this tournament yet.
        </p>
      )}
    </div>
  )
}
