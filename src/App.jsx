import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import HubPage from './components/HubPage'
import Flashcard from './components/Flashcard'
import Quiz from './components/Quiz'
import Dashboard from './components/Dashboard'
import FocusReview from './components/FocusReview'
import { FishProvider } from './utils/FishContext'
import FishToast from './components/FishToast'
import { LOADING as LOADING_COPY, pick } from './utils/humorConstants'

const WordList = lazy(() => import('./components/WordList'))

const LOADING = (
  <div className="flex flex-col items-center justify-center py-20 gap-3 min-h-dvh bg-surface-50">
    <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    <span className="text-surface-400 text-sm animate-pulse italic">{pick(LOADING_COPY)}</span>
  </div>
)

export default function App() {
  return (
    <BrowserRouter basename="/symmetrical-succotash">
      <FishProvider>
        <FishToast />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/study" element={<HubPage />} />
          <Route path="/study/learn" element={<Page><Flashcard /></Page>} />
          <Route path="/study/quiz" element={<Page><Quiz /></Page>} />
          <Route path="/study/focus" element={<Page><FocusReview /></Page>} />
          <Route path="/study/wordlist" element={<Page><WordList /></Page>} />
          <Route path="/study/dashboard" element={<Page><Dashboard /></Page>} />
        </Routes>
      </FishProvider>
    </BrowserRouter>
  )
}

function Page({ children }) {
  return (
    <Suspense fallback={LOADING}>
      {children}
    </Suspense>
  )
}
