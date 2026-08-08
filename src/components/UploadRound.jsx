import React, { useRef, useState, useCallback } from 'react'
import { Upload, X, AlertCircle, Loader2, Image } from 'lucide-react'

export default function UploadRound({ onUpload, onClose, isUploading, error, roundNumber, isEditing = false }) {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isUploading) onClose() }}
    >
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        width: '100%', maxWidth: 520,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>
              {isEditing ? `Re-upload Round ${roundNumber}` : `Add Round ${roundNumber}`}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {isEditing
                ? 'Upload a corrected score card — it will replace the existing round'
                : 'Upload a photo of the score card — Claude will parse it automatically'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Upload area */}
        <div style={{ padding: 24 }}>
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--accent-green-dim)' : 'var(--bg-primary)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'var(--accent-green-dim)',
                border: '1px solid var(--accent-green-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Upload size={22} color="var(--accent-green)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
                Drop score card image here
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                or click to browse · JPG, PNG supported
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div>
              {/* Image preview */}
              <div style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                marginBottom: 16,
                position: 'relative',
              }}>
                <img
                  src={preview}
                  alt="Score card preview"
                  style={{ width: '100%', maxHeight: 260, objectFit: 'contain', background: '#000', display: 'block' }}
                />
                <button
                  onClick={() => { setPreview(null); setSelectedFile(null) }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                <Image size={13} />
                {selectedFile?.name}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12, padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={onClose}
              disabled={isUploading}
              style={{
                flex: 1, padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              style={{
                flex: 2, padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: !selectedFile || isUploading ? 'var(--bg-elevated)' : 'var(--accent-green)',
                border: '1px solid transparent',
                color: !selectedFile || isUploading ? 'var(--text-muted)' : '#0d0f1a',
                fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
                cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Parsing score card…
                </>
              ) : (
                <>
                  <Upload size={15} />
                  {isEditing ? 'Parse & Replace Round' : 'Parse & Add Round'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
