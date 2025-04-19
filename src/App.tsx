
import axios from 'axios';
import React, { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ChecklistDetail from './ChecklistDetail'; // Import ChecklistDetail

// Define types for the checklist, category, and item
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
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const res = await axios.get<Checklist[]>('http://localhost:8000/api/checklists/');
      setChecklists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/checklists/', { title, description });
      setTitle('');
      setDescription('');
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChecklist = async (e : FormEvent, id: number) => {
    e.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/api/checklists/${id}/`);
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClone = async (e: FormEvent, id: number) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/checklists/${id}/clone/`);
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="container">
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
            </div>
            
          ))}
        </div>

        {/* Use Routes and Route for React Router v6 */}
        <Routes>
          <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
