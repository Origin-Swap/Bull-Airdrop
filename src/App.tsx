import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './components/ClaimForm';
import Layout from './components/Layout';

function App() {
  return (
        <Routes>
          <Route path="/" element={<HomePage  />} />
        </Routes>
  );
}

export default App;
