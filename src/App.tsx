import axios from 'axios';
import React, { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import ChecklistDetail from './ChecklistDetail';
import SharedChecklistDetail from "./SharedCheckListDetail";
import { LoginButton, LogoutButton } from './Auth0';
import { useAuth0 } from "@auth0/auth0-react";

// Define types
interface Item {
  id: number;
  name: string;
  is_completed: boolean;
}
interface Category {
  id: number;
  name: string;
  items: Item[];
}
interface Checklist {
  id: number;
  title: string;
  description: string;
  categories: Category[];
}

function App() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [shareLinks, setShareLinks] = useState<Record<number, string>>({});
  const location = useLocation();
  const isSharePage = location.pathname.startsWith("/share/");

  useEffect(() => {
    if (!isSharePage && isAuthenticated) {
      fetchChecklists();
    }
  }, [isAuthenticated, isSharePage]);

  const fetchChecklists = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get<Checklist[]>('http://localhost:8000/api/checklists/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChecklists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        'http://localhost:8000/api/checklists/',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChecklist = async (e: FormEvent, id: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(`http://localhost:8000/api/checklists/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClone = async (e: FormEvent, id: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.post(`http://localhost:8000/api/checklists/${id}/clone/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (e: FormEvent, id: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `http://localhost:8000/api/checklists/${id}/share/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareLinks((prev) => ({
        ...prev,
        [id]: res.data.share_url,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  return (
    // <Router>
      <div className="container">
        {/* 🔥 Loading screen */}
        {isLoading ? (
          <p>Loading...</p>
        ) : isSharePage ? (
          // 🔓 Public share page, no login required
          <Routes>
            <Route path="/share/:token/" element={<SharedChecklistDetail />} />
          </Routes>
        ) : !isAuthenticated ? (
          // 🔒 Protected pages require login
          <div>
            <LoginButton />
          </div>
        ) : (
          // ✅ Authenticated user content
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p>Welcome, {user?.name}!</p>
              <img src={user?.picture} alt="User Avatar" style={{ width: '50px', borderRadius: '50%' }} />
              <LogoutButton />
            </div>

            <h1>Checklists</h1>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Checklist Title"
                required
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <button type="submit">Add Checklist</button>
            </form>

            <div>
              {checklists.map((cl) => (
                <div key={cl.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                  <h2>{cl.title}</h2>
                  <button onClick={(e) => handleClone(e, cl.id)} style={{ marginRight: '1rem' }}>
                    Clone Checklist
                  </button>
                  <p>{cl.description}</p>
                  <Link to={`/checklist/${cl.id}`}>Go to Checklist</Link>
                  <button onClick={(e) => handleDeleteChecklist(e, cl.id)} style={{ marginLeft: '1rem' }}>
                    Delete Checklist
                  </button>
                  <button onClick={(e) => handleShare(e, cl.id)} style={{ marginLeft: '1rem' }}>
                    Share
                  </button>

                  {shareLinks[cl.id] && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <input
                        type="text"
                        readOnly
                        value={shareLinks[cl.id]}
                        style={{ width: '70%' }}
                      />
                      <button onClick={() => copyToClipboard(shareLinks[cl.id])} style={{ marginLeft: '0.5rem' }}>
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Routes>
              <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
              <Route path="/share/:token/" element={<SharedChecklistDetail />} />
            </Routes>
          </>
        )}
      </div>
    // </Router>
  );
}

export default App;
