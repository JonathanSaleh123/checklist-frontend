import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField
} from '@mui/material';

interface UploadedFile {
  id: number;
  file: string;
}
interface Item {
  id: number;
  name: string;
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
  const [itemNameMap, setItemNameMap] = useState<Record<number, string>>({});
  const [categoryFileMap, setCategoryFileMap] = useState<Record<number, File | null>>({});
  const [itemFileMap, setItemFileMap] = useState<Record<number, File | null>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [renamedCategory, setRenamedCategory] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [renamedItem, setRenamedItem] = useState<string>('');

  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

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
  const itemName = itemNameMap[categoryId];
  if (!checklist || !itemName) return;

  try {
    const token = await getAccessTokenSilently();
    await axios.post(
      `http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/items/`,
      { name: itemName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setItemNameMap(prev => ({ ...prev, [categoryId]: '' }));
    fetchChecklist();
  } catch (err) {
    console.error(err);
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
  const handleRenameCategory = async (e: FormEvent, categoryId: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.patch(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/`,
        { name: renamedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCategoryId(null);
      setRenamedCategory('');
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameItem = async (e: FormEvent, categoryId: number, itemId: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.patch(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${categoryId}/items/${itemId}/`,
        { name: renamedItem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingItemId(null);
      setRenamedItem('');
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

  const handleDeleteCategoryFile = async (catId: number, fileId: number) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${catId}/files/${fileId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChecklist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItemFile = async (catId: number, itemId: number, fileId: number) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `http://localhost:8000/api/checklists/${checklistId}/categories/${catId}/items/${itemId}/files/${fileId}/`,
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

  const onItemFileChange = (itemId: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setItemFileMap(prev => ({ ...prev, [itemId]: e.target.files?.[0] || null }));
    }
  };

  if (!checklist) return <div>Loading...</div>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>{checklist.title}</Typography>
      <Typography variant="body1" paragraph>{checklist.description}</Typography>

      <Box component="form" onSubmit={(e) => handleCategorySubmit(e)} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          sx={{ mb: 1 }}
        />
        <Button variant="contained" type="submit">Add Category</Button>
      </Box>

      {checklist.categories.map((cat) => (
        <Card key={cat.id} sx={{ mb: 3 }}>
          <CardContent>
            {editingCategoryId === cat.id ? (
              <Box component="form" onSubmit={(e) => handleRenameCategory(e, cat.id)} sx={{ mb: 2 }}>
                <TextField
                  value={renamedCategory}
                  onChange={(e) => setRenamedCategory(e.target.value)}
                  label="Rename Category"
                  fullWidth
                  required
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button type="submit" size="small" variant="contained">Save</Button>
                  <Button size="small" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{cat.name}</Typography>
                <Box>
                  <Button size="small" onClick={() => { setEditingCategoryId(cat.id); setRenamedCategory(cat.name); }}>Rename</Button>
                  <Button color="error" onClick={() => handleDeleteCategory(cat.id)}>Delete</Button>
                </Box>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mt: 2 }}>Category Files</Typography>
            <ul>
              {cat.files.map(f => (
                <li key={f.id}>
                  <a href={f.file} target="_blank" rel="noreferrer">{f.file.split('/').pop()}</a>
                  <Button size="small" color="error" onClick={() => handleDeleteCategoryFile(cat.id, f.id)}>Delete</Button>
                </li>
              ))}
            </ul>

            <Box component="form" onSubmit={(e) => handleCategoryFileUpload(e, cat.id)} sx={{ mt: 1 }}>
              <input type="file" onChange={(e) => onCategoryFileChange(cat.id, e)} required />
              <Button size="small" type="submit" variant="outlined" sx={{ ml: 1 }}>
                Upload
              </Button>
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 3 }}>Items</Typography>
            <ul>
              {cat.items.map((item) => (
                <li key={item.id}>
                  {editingItemId === item.id ? (
                    <Box component="form" onSubmit={(e) => handleRenameItem(e, cat.id, item.id)} sx={{ mb: 1 }}>
                      <TextField
                        value={renamedItem}
                        onChange={(e) => setRenamedItem(e.target.value)}
                        label="Rename Item"
                        fullWidth
                        required
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button type="submit" size="small" variant="contained">Save</Button>
                        <Button size="small" onClick={() => setEditingItemId(null)}>Cancel</Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">{item.name}</Typography>
                      <Box>
                        <Button size="small" onClick={() => { setEditingItemId(item.id); setRenamedItem(item.name); }}>Rename</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteItem(cat.id, item.id)}>Delete Item</Button>
                      </Box>
                    </Box>
                  )}

                  <ul>
                    {item.files.map(f => (
                      <li key={f.id}>
                        <a href={f.file} target="_blank" rel="noreferrer">{f.file.split('/').pop()}</a>
                        <Button size="small" color="error" onClick={() => handleDeleteItemFile(cat.id, item.id, f.id)}>
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <Box component="form" onSubmit={(e) => handleItemFileUpload(e, cat.id, item.id)} sx={{ mt: 1 }}>
                    <input type="file" onChange={(e) => onItemFileChange(item.id, e)} required />
                    <Button size="small" type="submit" variant="outlined" sx={{ ml: 1 }}>
                      Upload
                    </Button>
                  </Box>
                </li>
              ))}
            </ul>

            <Box component="form" onSubmit={(e) => handleItemSubmit(e, cat.id)} sx={{ mt: 2 }}>
              <TextField
                  fullWidth
                  label="Item Name"
                  value={itemNameMap[cat.id] || ''}
                  onChange={(e) => setItemNameMap(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  required
                  sx={{ mb: 1 }}
                />
              <Button variant="contained" type="submit">Add Item</Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default ChecklistDetail;



