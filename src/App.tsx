import './App.css';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Register from './pages/Register';
import { Stream } from './pages/Stream';
import Transfer from './pages/Transfer';

function App() {
  return (
    <>
      <BrowserRouter>

        <Navbar />
        <Routes>
          <Route path="/" element={<Transfer />} />
          <Route path="/register" element={<Register />} />
          <Route path='/stream' element={<Stream />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;  