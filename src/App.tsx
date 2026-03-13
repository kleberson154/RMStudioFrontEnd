import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import About from './components/About'
import Services from './components/Services'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Agendamento from './pages/Agendamento'
import AgendamentoSucesso from './pages/AgendamentoSucesso'

function BookingPage() {
  return (
    <div className="flex flex-col font-display">
      <Header />
      <Home />
      <About />
      <Services />
      <Contact />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
      <Route path="/agendamento" element={<Agendamento />} />
      <Route path="/agendamento/sucesso" element={<AgendamentoSucesso />} />
    </Routes>
  )
}

export default App
