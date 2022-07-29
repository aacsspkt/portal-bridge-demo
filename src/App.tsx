import './App.css';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import Register from './pages/Register';
import Transfer from './pages/Transfer';
import { Stream } from './pages/Stream';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Transfer />} />
          <Route path="/register" element={<Register />} />
          <Route path='/stream' element = {<Stream/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;