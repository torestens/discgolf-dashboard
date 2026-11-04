import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import RoundNav from './components/RoundNav.jsx'
import ScoreCard from './components/ScoreCard.jsx'
import LeaderBoard from './components/LeaderBoard.jsx'
import { RoundSummary, BottomStats } from './components/StatsSection.jsx'
import UploadRound from './components/UploadRound.jsx'
import AdminPinModal from './components/AdminPinModal.jsx'
import EmptyState from './components/EmptyState.jsx'
import TournamentSelector from './components/TournamentSelector.jsx'
import { parseScoreCardWithClaude } from './utils/parseScoreCard.js'
import { fetchRounds, saveRound } from './utils/roundsApi.js'

const TOURNAMENTS = [
  {
    id: 'spring-2026',
    name: 'VDGA 2026 Spring Tour',
    shortName: 'Spring Tour 2026',
    totalRounds: 10,
    roundsThatCount: 5,
    completed: true,
    season: 'spring',
  },
  {
    id: 'autumn-2026',
    name: 'VDGA 2026 Autumn Tour',
    shortName: 'Autumn Tour 2026',
    totalRounds: 10,
    roundsThatCount: 5,
    completed: false,
    season: 'autumn',
  },
]
const DEFAULT_TOURNAMENT_ID = 'autumn-2026'

export default function App() {
  const [currentTournamentId, setCurrentTournamentId] = useState(DEFAULT_TOURNAMENT_ID)
  const [roundsCache, setRoundsCache] = useState({})
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [editingRoundIndex, setEditingRoundIndex] = useState(null)
  const [adminPin, setAdminPin] = useState(null)
  const [pendingAdminAction, setPendingAdminAction] = useState(null) // 'add' | number (round index to edit)

  const tournament = TOURNAMENTS.find(t => t.id === currentTournamentId)
  const rounds = roundsCache[currentTournamentId] || []

  // Apply seasonal background on body
  useEffect(() => {
    document.body.setAttribute('data-season', tournament.season)
    return () => document.body.removeAttribute('data-season')
  }, [tournament.season])

  // Load rounds when tournament changes
  useEffect(() => {
    if (roundsCache[currentTournamentId] !== undefined) {
      const cached = roundsCache[currentTournamentId]
      setCurrentRoundIndex(cached.length > 0 ? cached.length - 1 : 0)
      setLoadingRounds(false)
      return
    }

    setLoadingRounds(true)
    setLoadError(null)
    fetchRounds(currentTournamentId)
      .then(data => {
        setRoundsCache(prev => ({ ...prev, [currentTournamentId]: data }))
        setCurrentRoundIndex(data.length > 0 ? data.length - 1 : 0)
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoadingRounds(false))
  }, [currentTournamentId])

  const handleTournamentChange = (id) => {
    if (id === currentTournamentId) return
    setCurrentTournamentId(id)
    setCurrentRoundIndex(0)
    setShowUpload(false)
    setEditingRoundIndex(null)
    setUploadError(null)
    setLoadError(null)
    if (roundsCache[id] === undefined) setLoadingRounds(true)
  }

  const currentRound = rounds[currentRoundIndex] || null
  const isLastRound = currentRoundIndex === rounds.length - 1
  const canAddRound = !tournament.completed && rounds.length < tournament.totalRounds

  // Open-action gated behind PIN. Stores action descriptor, not a function, to avoid
  // React's functional-setState ambiguity.
  const executeAdminAction = (action) => {
    if (action === 'add') {
      setShowUpload(true)
    } else if (typeof action === 'number') {
      setUploadError(null)
      setEditingRoundIndex(action)
    }
  }

  const requestAdmin = (action) => {
    if (adminPin !== null) {
      executeAdminAction(action)
    } else {
      setPendingAdminAction(action)
    }
  }

  const handlePinSuccess = (pin) => {
    setAdminPin(pin)
    const action = pendingAdminAction
    setPendingAdminAction(null)
    if (action !== null) executeAdminAction(action)
  }

  const handleImageUpload = useCallback(async (file) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const parsed = await parseScoreCardWithClaude(file, adminPin)
      const newRound = {
        ...parsed,
        id: Date.now(),
        roundNumber: rounds.length + 1,
        uploadedAt: new Date().toISOString(),
      }
      await saveRound(newRound, adminPin, currentTournamentId)
      setRoundsCache(prev => {
        const updated = [...(prev[currentTournamentId] || []), newRound]
        setCurrentRoundIndex(updated.length - 1)
        return { ...prev, [currentTournamentId]: updated }
      })
      setShowUpload(false)
    } catch (err) {
      setUploadError(err.message || 'Failed to parse score card. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [rounds.length, adminPin, currentTournamentId])

  const handleEditUpload = useCallback(async (file) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const parsed = await parseScoreCardWithClaude(file, adminPin)
      const idx = editingRoundIndex
      const existing = rounds[idx]
      const updatedRound = {
        ...parsed,
        id: existing.id,
        roundNumber: existing.roundNumber,
        uploadedAt: new Date().toISOString(),
      }
      await saveRound(updatedRound, adminPin, currentTournamentId)
      setRoundsCache(prev => {
        const updated = [...(prev[currentTournamentId] || [])]
        updated[idx] = updatedRound
        return { ...prev, [currentTournamentId]: updated }
      })
      setEditingRoundIndex(null)
    } catch (err) {
      setUploadError(err.message || 'Failed to parse score card. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [editingRoundIndex, adminPin, rounds, currentTournamentId])

  const goToPrevRound = () => {
    if (currentRoundIndex > 0) setCurrentRoundIndex(i => i - 1)
  }

  const goToNextRound = () => {
    if (currentRoundIndex < rounds.length - 1) setCurrentRoundIndex(i => i + 1)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        tournamentName={tournament.name}
        totalRounds={tournament.totalRounds}
        completedRounds={rounds.length}
        onAddRound={canAddRound ? () => requestAdmin('add') : null}
      />

      <main style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 20px 60px' }}>
        <TournamentSelector
          tournaments={TOURNAMENTS}
          currentId={currentTournamentId}
          onChange={handleTournamentChange}
        />

        {loadingRounds ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading rounds…</p>
          </div>
        ) : loadError ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Failed to load rounds: {loadError}</p>
          </div>
        ) : rounds.length === 0 ? (
          <EmptyState onUpload={canAddRound ? () => requestAdmin('add') : null} />
        ) : (
          <>
            <RoundNav
              rounds={rounds}
              currentIndex={currentRoundIndex}
              onPrev={goToPrevRound}
              onNext={goToNextRound}
              onSelect={setCurrentRoundIndex}
            />

            <div className="fade-in" key={`${currentTournamentId}-${currentRoundIndex}`}>
              <ScoreCard
                round={currentRound}
                roundNumber={currentRoundIndex + 1}
                onEdit={!tournament.completed ? () => requestAdmin(currentRoundIndex) : null}
              />

              <RoundSummary round={currentRound} />

              <LeaderBoard
                rounds={rounds}
                upToRoundIndex={currentRoundIndex}
                roundsToCount={tournament.roundsThatCount}
                isCurrentFinal={isLastRound}
              />

              <BottomStats
                rounds={rounds}
                upToRoundIndex={currentRoundIndex}
                roundsToCount={tournament.roundsThatCount}
              />
            </div>
          </>
        )}
      </main>

      {showUpload && (
        <UploadRound
          onUpload={handleImageUpload}
          onClose={() => { setShowUpload(false); setUploadError(null) }}
          isUploading={isUploading}
          error={uploadError}
          roundNumber={rounds.length + 1}
        />
      )}

      {editingRoundIndex !== null && (
        <UploadRound
          isEditing
          onUpload={handleEditUpload}
          onClose={() => { setEditingRoundIndex(null); setUploadError(null) }}
          isUploading={isUploading}
          error={uploadError}
          roundNumber={editingRoundIndex + 1}
        />
      )}

      {pendingAdminAction !== null && (
        <AdminPinModal
          onSuccess={handlePinSuccess}
          onClose={() => setPendingAdminAction(null)}
        />
      )}
    </div>
  )
}
