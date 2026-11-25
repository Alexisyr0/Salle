import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import ExercisePage from './pages/ExercisePage'
import Programme from './pages/Programme'
import SeancePage from './pages/SeancePage'
import LogPage from './pages/LogPage'
import MobilitePage from './pages/MobilitePage'
import Journal from './pages/Journal'
import RestBar from './components/RestBar'
import { SyncDot } from './components/SyncCard'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <header className="topbar">
        <span className="brand">
          <span className="brand-dot" /> Muscu
        </span>
        <span className="top-right">
          <NavLink to="/programme" className="top-plan">
            Plan
          </NavLink>
          <NavLink to="/journal" className="sync-link" aria-label="État de la synchro">
            <SyncDot />
          </NavLink>
        </span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exo/:id" element={<ExercisePage />} />
          <Route path="/programme" element={<Programme />} />
          <Route path="/body-a" element={<SeancePage id="A" />} />
          <Route path="/body-b" element={<SeancePage id="B" />} />
          <Route path="/log/:date" element={<LogPage />} />
          <Route path="/maison" element={<SeancePage id="Maison" />} />
          <Route path="/mobilite" element={<MobilitePage />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
      <RestBar />
      <nav className="tabbar">
        <NavLink to="/" end>
          <span className="tab-ic">◎</span>Exos
        </NavLink>
        <NavLink to="/body-a">
          <span className="tab-ic">A</span>Body A
        </NavLink>
        <NavLink to="/body-b">
          <span className="tab-ic">B</span>Body B
        </NavLink>
        <NavLink to="/maison">
          <span className="tab-ic">⌂</span>Maison
        </NavLink>
        <NavLink to="/mobilite">
          <span className="tab-ic">∿</span>Mobilité
        </NavLink>
        <NavLink to="/journal">
          <span className="tab-ic">▦</span>Journal
        </NavLink>
      </nav>
    </HashRouter>
  )
}
