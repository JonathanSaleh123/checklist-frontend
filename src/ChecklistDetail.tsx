import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

function ChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

  const fetchChecklist = async () => {
    try {
      const res = await axios.get<Checklist>(`http://localhost:8000/api/checklists/${checklistId}/`);
      setChecklist(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (checklist) {
      try {
        // Post request with checklistId to add category
        await axios.post(`http://localhost:8000/api/checklists/${checklistId}/categories/`, { name: categoryName });
        setCategoryName('');
        fetchChecklist();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleItemSubmit = async (e: FormEvent, categoryId: number) => {
    e.preventDefault();
    if (checklist) {
      try {
        // Post request with checklistId and categoryId to add item
        await axios.post(`http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/items/`, { name: itemName });
        setItemName('');
        fetchChecklist();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (checklist) {
      try {
        // Delete request with checklistId and categoryId
        await axios.delete(`http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/`);
        fetchChecklist();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (checklist) {
      try {
        // Delete request with checklistId and itemId
        await axios.delete(`http://localhost:8000/api/checklists/${checklistId}/categories/${itemId}/items/`);
        fetchChecklist();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!checklist) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>{checklist.title}</h2>
      <p>{checklist.description}</p>
      <form onSubmit={handleCategorySubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          required
        />
        <button type="submit">Add Category</button>
      </form>

      {checklist.categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h3>{cat.name}</h3>
          <button onClick={() => handleDeleteCategory(cat.id)}>Delete Category</button>
          <ul>
            {cat.items.map((item) => (
              <li key={item.id}>
                {item.name}
                <button onClick={() => handleDeleteItem(item.id)}>Delete Item</button>
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => handleItemSubmit(e, cat.id)} style={{ marginTop: '1rem' }}>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
              required
            />
            <button type="submit">Add Item</button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default ChecklistDetail;
