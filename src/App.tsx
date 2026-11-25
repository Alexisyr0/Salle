import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import ExercisePage from './pages/ExercisePage'
import Programme from './pages/Programme'
import SeancePage from './pages/SeancePage'

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
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exo/:id" element={<ExercisePage />} />
          <Route path="/programme" element={<Programme />} />
          <Route path="/body-a" element={<SeancePage id="A" />} />
          <Route path="/body-b" element={<SeancePage id="B" />} />
        </Routes>
      </main>
      <nav className="tabbar">
        <NavLink to="/" end>
          <span className="tab-ic">◎</span>Exercices
        </NavLink>
        <NavLink to="/body-a">
          <span className="tab-ic">A</span>Body A
        </NavLink>
        <NavLink to="/body-b">
          <span className="tab-ic">B</span>Body B
        </NavLink>
        <NavLink to="/programme">
          <span className="tab-ic">☰</span>Programme
        </NavLink>
      </nav>
    </HashRouter>
  )
}
