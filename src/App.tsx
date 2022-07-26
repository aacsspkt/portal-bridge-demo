import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar';
import Transfer from './pages/Transfer';
import Register from './pages/Register';



function App() {
  

  


  return (
    <>
     
      <BrowserRouter>
     
      <Routes>
        <Route  path="/" element={<Transfer/>}/>
        <Route path="/register" element={<Register/>} />
       
      </Routes>
    </BrowserRouter>
     
      
    </>
  );
}

export default App;