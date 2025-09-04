import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UrlShortener from './components/UrlShortener';
import RedirectHandler from './components/RedirectHandler';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/:shortcode" element={<RedirectHandler />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
