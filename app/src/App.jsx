import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Accueil from './pages/Accueil'
import Modules from './pages/Modules'
import EcouteReconnaissance from './pages/EcouteReconnaissance'
import MemoryLettres from './pages/MemoryLettres'
import DistinctionPhonemes from './pages/DistinctionPhonemes'
import TracageLettres from './pages/TracageLettres'
import FlashcardsVocabulaire from './pages/FlashcardsVocabulaire'
import DashboardEnfant from './pages/DashboardEnfant'
import BadgesPage from './pages/BadgesPage'
import DashboardMaitresse from './pages/DashboardMaitresse'
import Conversation from './pages/Conversation'
import Syllabes from './pages/Syllabes'
import ChansonAlphabet from './pages/ChansonAlphabet'
import EvaluationNiveau from './pages/EvaluationNiveau'
import { useAppStore } from './store/useAppStore'

function App() {
  const darkMode = useAppStore(state => state.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Accueil />} />
          <Route path="modules" element={<Modules />} />
          <Route path="ecoute" element={<EcouteReconnaissance />} />
          <Route path="memory" element={<MemoryLettres />} />
          <Route path="phonemes" element={<DistinctionPhonemes />} />
          <Route path="tracage" element={<TracageLettres />} />
          <Route path="flashcards" element={<FlashcardsVocabulaire />} />
          <Route path="conversation" element={<Conversation />} />
          <Route path="dashboard-enfant" element={<DashboardEnfant />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="maitresse" element={<DashboardMaitresse />} />
          <Route path="syllabes" element={<Syllabes />} />
          <Route path="chanson" element={<ChansonAlphabet />} />
          <Route path="evaluation" element={<EvaluationNiveau />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
