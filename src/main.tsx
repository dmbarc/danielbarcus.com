import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './index.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { InstrumentFaultIsolation } from './pages/InstrumentFaultIsolation'
import { InstrumentOscilloscope } from './pages/InstrumentOscilloscope'
import { NotFound } from './pages/NotFound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="instruments/oscilloscope" element={<InstrumentOscilloscope />} />
          <Route path="instruments/fault-isolation" element={<InstrumentFaultIsolation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
