import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import CreatePoll from './pages/CreatePoll/CreatePoll'
import Auth from './pages/Auth/Auth'
import Admin from './pages/Admin/Admin'
import Dashboard from './pages/Dashboard/Dashboard'
import PollDetail from './pages/PollDetail/PollDetail'
import Polls from './pages/Polls/Polls'
import About from './pages/About/About'
import Team from './pages/Team/Team'

function App() {

  return (
    <BrowserRouter>
       <Navbar/> 
       <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/create' element={<CreatePoll/>} />
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/polls' element={<Polls/>}/>
        <Route path='/poll/:slug' element={<PollDetail/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/team' element={<Team/>}/>

       </Routes>
       <Footer/>
    </BrowserRouter>
  )
}

export default App
