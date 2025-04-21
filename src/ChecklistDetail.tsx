import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

// Define types for the checklist, category, and item

interface UploadedFile {
    id: number;
    file: string;
}
interface Item {
  id: number;
  name: string;
  is_completed: boolean;
  files: UploadedFile[];
}

interface Category {
  id: number;
  name: string;
  items: Item[];
  files: UploadedFile[]; 
}

interface Checklist {
  id: number;
  title: string;
  description: string;
  categories: Category[];
}

function ChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  // track one selected file per category:
  const [categoryFileMap, setCategoryFileMap] = useState<Record<number, globalThis.File | null>>({});
  // track one selected file per item:
  const [itemFileMap, setItemFileMap] = useState<Record<number, File|null>>({});
  const navigate = useNavigate();
  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

  const { getAccessTokenSilently } = useAuth0();
  const fetchChecklist = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get<Checklist>(
        `http://localhost:8000/api/checklists/${checklistId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChecklist(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (checklist) {
      try {
        const token = await getAccessTokenSilently();
        await axios.post(
          `http://localhost:8000/api/checklists/${checklistId}/categories/`,
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const token = await getAccessTokenSilently();
        await axios.post(
          `http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/items/`,
          { name: itemName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const token = await getAccessTokenSilently();
        await axios.delete(
          `http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchChecklist();
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const handleDeleteItem = async (categoryId: number, itemId: number) => {
    if (!checklist) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `http://localhost:8000/api/checklists/${checklist.id}/categories/${categoryId}/items/${itemId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleCategoryFileUpload = async (e: FormEvent, catId: number) => {
    e.preventDefault();
    const file = categoryFileMap[catId];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${catId}/files/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategoryFileMap(prev => ({ ...prev, [catId]: null }));
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteCategoryFile = async (catId: number, fileId: number) => {
    if (!checklist) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `http://localhost:8000/api/checklists/${checklist.id}/categories/${catId}/files/${fileId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleItemFileUpload = async (e: FormEvent, catId: number, itemId: number) => {
    e.preventDefault();
    const file = itemFileMap[itemId];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${catId}/items/${itemId}/files/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItemFileMap(prev => ({ ...prev, [itemId]: null }));
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteItemFile = async (catId: number, itemId: number, fileId: number) => {
    if (!checklist) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `http://localhost:8000/api/checklists/${checklist.id}/categories/${catId}/items/${itemId}/files/${fileId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };
  

  const onCategoryFileChange = (catId: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCategoryFileMap(prev => ({ ...prev, [catId]: e.target.files?.[0] || null }));
    }
  };
  // likewise for items:
  const onItemFileChange = (itemId: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setItemFileMap(prev => ({ ...prev, [itemId]: e.target.files?.[0] || null }));
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
          {/* list already‑uploaded category files */}
            <ul>
            {cat.files.map(f => (
              <li key={f.id}>
                <a href={f.file} target="_blank" rel="noreferrer">
                  {f.file.split('/').pop()}
                </a>
                <button onClick={() => handleDeleteCategoryFile(cat.id, f.id)}>Delete File</button>
              </li>
                
            ))}
            </ul>
            { /* form to upload a new file for this category */}
            <form onSubmit={(e) => handleCategoryFileUpload(e, cat.id)}>
            <input
              type="file"
              onChange={(e) => onCategoryFileChange(cat.id, e)}
              required
            />
            <button type="submit">Upload File</button>
            </form>

          <button onClick={() => handleDeleteCategory(cat.id)}>Delete Category</button>
          <ul>
            {cat.items.map((item) => (
              <li key={item.id}>
                {item.name}
                { /* Files for this item */}
                <ul>
                    {item.files?.map(f => (
                      <li key={f.id}>
                        <a href={f.file} target="_blank" rel="noreferrer">
                            {f.file.split('/').pop()}
                        </a>
                        <button onClick={() => handleDeleteItemFile(cat.id, item.id, f.id)}>Delete File</button>
                      </li>
                    ))}
                </ul>
                { /* form to upload a new file for this item */}

                <form onSubmit={(e) => handleItemFileUpload(e, cat.id, item.id)}>
                  <input
                    type="file"
                    onChange={(e) => onItemFileChange(item.id, e)}
                    required
                  />
                  <button type="submit">Upload File</button>
                </form>
                
                <button onClick={() => handleDeleteItem(cat.id, item.id)}>Delete Item</button>
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
