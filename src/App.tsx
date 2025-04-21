import axios from 'axios';
import React, { useState, useEffect, FormEvent } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation
} from 'react-router-dom';
import ChecklistDetail from './ChecklistDetail';
import SharedChecklistDetail from './SharedCheckListDetail';
import { LoginButton, LogoutButton } from './Auth0';
import { useAuth0 } from '@auth0/auth0-react';

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  TextField,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';

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
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [renamedTitle, setRenamedTitle] = useState<string>('');
  const [renamedDescription, setRenamedDescription] = useState<string>('');
  const location = useLocation();
  const isSharePage = location.pathname.startsWith('/share/');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isSharePage && isAuthenticated) {
      fetchChecklists();
    }
  }, [isAuthenticated, isSharePage]);

  const fetchChecklists = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get<Checklist[]>('http://localhost:8000/api/checklists/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChecklists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAlertMessage('You must be logged in to create a checklist.');
      return;
    }
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
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
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
        [id]: res.data.share_url
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameChecklist = async (e: FormEvent, id: number) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.patch(
        `http://localhost:8000/api/checklists/${id}/`,
        { title: renamedTitle, description: renamedDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingChecklistId(null);
      setRenamedTitle('');
      setRenamedDescription('');
      fetchChecklists();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              🏠 Home
            </Link>
          </Typography>
          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>{user.name}</Typography>
              <Avatar src={user.picture} alt="User Avatar" sx={{ width: 36, height: 36 }} />
              <LogoutButton />
            </Box>
          )}
          {!isAuthenticated && !isLoading && <LoginButton />}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {alertMessage && (
          <Alert severity="warning" onClose={() => setAlertMessage('')} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : isSharePage ? (
          <Routes>
            <Route path="/share/:token/" element={<SharedChecklistDetail />} />
          </Routes>
        ) : (
          <>
            {isHomePage && (
              <>
                <Typography variant="h4" gutterBottom>Custom Checklist App</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                  <TextField
                    label="Checklist Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button type="submit" variant="contained">Add Checklist</Button>
                </Box>

                <Grid container spacing={2}>
                  {checklists.map((cl) => (
                    <Grid size={{ xs: 12, md: 6 }} key={cl.id}>
                      <Card>
                        <CardContent>
                          {editingChecklistId === cl.id ? (
                            <Box component="form" onSubmit={(e) => handleRenameChecklist(e, cl.id)} sx={{ mb: 2 }}>
                              <TextField
                                value={renamedTitle}
                                onChange={(e) => setRenamedTitle(e.target.value)}
                                label="Rename Title"
                                fullWidth
                                required
                                sx={{ mb: 1 }}
                              />
                              <TextField
                                value={renamedDescription}
                                onChange={(e) => setRenamedDescription(e.target.value)}
                                label="Edit Description"
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ mb: 1 }}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button type="submit" size="small" variant="contained">Save</Button>
                                <Button size="small" onClick={() => setEditingChecklistId(null)}>Cancel</Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>{cl.title}</Typography>
                                <IconButton size="small" onClick={() => {
                                  setEditingChecklistId(cl.id);
                                  setRenamedTitle(cl.title);
                                  setRenamedDescription(cl.description);
                                }}>
                                  ✏️
                                </IconButton>
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>{cl.description}</Typography>
                            </>
                          )}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={(e) => handleClone(e, cl.id)}>
                              Clone
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              component={Link}
                              to={`/checklist/${cl.id}`}
                              endIcon={<span>➡️</span>}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => handleDeleteChecklist(e, cl.id)}
                              color="error"
                            >
                              Delete
                            </Button>
                            <Button variant="outlined" size="small" onClick={(e) => handleShare(e, cl.id)}>
                              Share
                            </Button>
                          </Box>
                          {shareLinks[cl.id] && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <TextField value={shareLinks[cl.id]} InputProps={{ readOnly: true }} fullWidth size="small" />
                              <Button size="small" onClick={() => copyToClipboard(shareLinks[cl.id])}>
                                Copy
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            <Routes>
              <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
              <Route path="/share/:token/" element={<SharedChecklistDetail />} />
            </Routes>
          </>
        )}
      </Container>
    </>
  );
}

export default App;
