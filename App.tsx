
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Pantry from './components/Pantry';
import Recipes from './components/Recipes';
import Planning from './components/Planning';
import ShoppingList from './components/ShoppingList';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 md:pl-64 pb-24 md:pb-0">
        <Navigation />
        
        <main className="p-4 md:p-12 animate-in fade-in duration-700">
          <Routes>
            <Route path="/" element={<Pantry />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/shopping" element={<ShoppingList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
