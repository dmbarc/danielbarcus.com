import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './index.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { InstrumentFaultIsolation } from './pages/InstrumentFaultIsolation'
import { InstrumentOscilloscope } from './pages/InstrumentOscilloscope'
import { InstrumentModelViewer } from './pages/InstrumentModelViewer'
import { InstrumentMfd } from './pages/InstrumentMfd'
import { ProjectIdleExplorers } from './pages/ProjectIdleExplorers'
import { ProjectBoomsweeper } from './pages/ProjectBoomsweeper'
import { NotFound } from './pages/NotFound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="instruments/oscilloscope" element={<InstrumentOscilloscope />} />
          <Route path="instruments/fault-isolation" element={<InstrumentFaultIsolation />} />
          <Route path="instruments/mfd" element={<InstrumentMfd />} />
          <Route path="instruments/model-viewer" element={<InstrumentModelViewer />} />
          <Route path="projects/boomsweeper" element={<ProjectBoomsweeper />} />
          <Route path="projects/idle-explorers" element={<ProjectIdleExplorers />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
