// SharedChecklistDetail.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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

export default function SharedChecklistDetail() {
  const { token } = useParams<{ token: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [catFileMap, setCatFileMap]     = useState<Record<number, File|null>>({});
  const [itemFileMap, setItemFileMap]   = useState<Record<number, File|null>>({});
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/share/${token}/`)
      .then(res => {
        setChecklist(res.data);
        setIsOwner(res.data.is_owner);
      })
      .catch(console.error);
  }, [token]);

  // handle category‐file selection & upload
  const onCatFileChange = (catId: number, e: ChangeEvent<HTMLInputElement>) => {
    setCatFileMap(m => ({ ...m, [catId]: e.target.files?.[0] || null }));
  };
  const uploadCatFile = (e: FormEvent, catId: number) => {
    e.preventDefault();
    const file = catFileMap[catId];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    axios.post(`http://localhost:8000/api/share/${token}/categories/${catId}/files/`, fd)
    .then(() => {
      setCatFileMap(m => ({ ...m, [catId]: null }));
      return axios.get<Checklist>(`/api/share/${token}/`);
    })
    .then(res => setChecklist(res.data))
    .catch(console.error);
  };

  // handle item‐file selection & upload
  const onItemFileChange = (itemId: number, e: ChangeEvent<HTMLInputElement>) => {
    setItemFileMap(m => ({ ...m, [itemId]: e.target.files?.[0] || null }));
  };
  const uploadItemFile = (e: FormEvent, catId: number, itemId: number) => {
    e.preventDefault();
    const file = itemFileMap[itemId];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    axios.post(`http://localhost:8000/api/share/${token}/categories/${catId}/items/${itemId}/files/`, fd)
    .then(() => {
      setItemFileMap(m => ({ ...m, [itemId]: null }));
      return axios.get<Checklist>(`/api/share/${token}/`);
    })
    .then(res => setChecklist(res.data))
    .catch(console.error);
  };

  if (!checklist) return <div>Loading shared checklist…</div>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>{checklist.title}</Typography>
      <Typography variant="body1" paragraph>{checklist.description}</Typography>
  
      {checklist.categories.map(cat => (
        <Card key={cat.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">{cat.name}</Typography>
  
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Category Files</Typography>
            <ul>
              {cat.files.map(f => (
                <li key={f.id}>
                  <a href={f.file} target="_blank" rel="noreferrer">
                    {f.file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
  
            <Box component="form" onSubmit={e => uploadCatFile(e, cat.id)} sx={{ mt: 1 }}>
              <input type="file" onChange={e => onCatFileChange(cat.id, e)} required />
              <Button variant="outlined" size="small" type="submit" sx={{ ml: 1 }}>
                Upload to category
              </Button>
            </Box>
  
            <Typography variant="subtitle1" sx={{ mt: 3 }}>Items</Typography>
            {cat.items.map(item => (
              <Box key={item.id} sx={{ mt: 2, pl: 2 }}>
                <Typography variant="body1" fontWeight="bold">{item.name}</Typography>
                <ul>
                  {item.files.map(f => (
                    <li key={f.id}>
                      <a href={f.file} target="_blank" rel="noreferrer">
                        {f.file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
                <Box component="form" onSubmit={e => uploadItemFile(e, cat.id, item.id)} sx={{ mt: 1 }}>
                  <input type="file" onChange={e => onItemFileChange(item.id, e)} required />
                  <Button variant="outlined" size="small" type="submit" sx={{ ml: 1 }}>
                    Upload to item
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
  
}
