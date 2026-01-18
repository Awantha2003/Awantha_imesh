import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Achievements } from './pages/Achievements';
import { Projects } from './pages/Projects';
import { Blogs } from './pages/Blogs';
import { AdminDashboard } from './pages/AdminDashboard';
import { GithubProjectDetails } from './pages/GithubProjectDetails';
import { ProjectDetails } from './pages/ProjectDetails';
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollToTop />
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans selection:bg-blue-500/30">
        <Sidebar />

        <main className="lg:pl-[320px] min-h-screen transition-all duration-300">
          <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/github/:repo" element={<GithubProjectDetails />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
