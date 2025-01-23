import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import Navbar from "./components/nav/Navbar";
import Home from "./pages/Home/Home";
import CreateToken from './pages/createToken/CreateToken';
import Footer from './components/footer/Footer';
import CardPage from './pages/cardpage/CardPage';
import Admin from './pages/admin/Admin';

const App = () => {
  return (
    <Router>
      <Navbar />
      {/* Routing for different pages */}
      <Routes>
        {/* Route for the Ranking page */}
        <Route path="/" element={<Home />} />
        <Route path="/token/:chain/:token" element={<CardPage />} />
        <Route path="/create-token" element={<CreateToken />} />
        <Route path="/admin-panel" element={<Admin />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
