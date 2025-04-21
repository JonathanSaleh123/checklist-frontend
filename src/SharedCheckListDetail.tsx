// SharedChecklistDetail.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface UploadedFile { id: number; file: string; }
interface Item        { id: number; name: string; files: UploadedFile[]; }
interface Category    { id: number; name: string; items: Item[]; files: UploadedFile[]; }
interface Checklist   { id: number; title: string; description: string; categories: Category[]; }

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
    <div className="container">
      <h2>{checklist.title}</h2>
      <p>{checklist.description}</p>

      {checklist.categories.map(cat => (
        <div key={cat.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
          <h3>{cat.name}</h3>

          {/* existing category files */}
          <ul>
            {cat.files.map(f => (
              <li key={f.id}>
                <a href={f.file} target="_blank" rel="noreferrer">
                  {f.file.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>

          {/* upload into this category */}
          <form onSubmit={e => uploadCatFile(e, cat.id)}>
            <input type="file" onChange={e => onCatFileChange(cat.id, e)} required />
            <button type="submit">Upload to category</button>
          </form>

          {/* items */}
          {cat.items.map(item => (
            <div key={item.id} style={{ marginTop: "0.5rem" }}>
              <strong>{item.name}</strong>
              <ul>
                {item.files.map(f => (
                  <li key={f.id}>
                    <a href={f.file} target="_blank" rel="noreferrer">
                      {f.file.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
              <form onSubmit={e => uploadItemFile(e, cat.id, item.id)}>
                <input type="file" onChange={e => onItemFileChange(item.id, e)} required />
                <button type="submit">Upload to item</button>
              </form>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
