import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './pages/Landing';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Other routes will go here */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
