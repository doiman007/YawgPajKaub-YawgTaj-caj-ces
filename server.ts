import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "DB" for demonstration
  let members = [
    { 
      id: '1', 
      name: 'John Doe', 
      gender: 'male' as const,
      birthDate: '1951-01-15', 
      deathDate: '2015-06-20',
      graveLocation: { lat: 13.7563, lng: 100.5018, address: 'สุสานวัดโสมนัสวิหาร กรุงเทพฯ' },
      photo: 'https://picsum.photos/seed/john/200', 
      bio: 'The patriarch. A loving grand-grandfather who started the family legacy.' 
    },
    { id: '2', name: 'Jane Doe', gender: 'female' as const, birthDate: '1954-05-22', photo: 'https://picsum.photos/seed/jane/200', bio: 'The matriarch.' },
    { id: '3', name: 'Michael Doe', gender: 'male' as const, birthDate: '1981-08-30', photo: 'https://picsum.photos/seed/michael/200', bio: 'First son.' },
    { id: '4', name: 'Sarah Doe', gender: 'female' as const, birthDate: '1984-03-12', photo: 'https://picsum.photos/seed/sarah/200', bio: 'Daughter.' },
    { id: '5', name: 'Emily Doe', gender: 'female' as const, birthDate: '2011-12-05', photo: 'https://picsum.photos/seed/emily/200', bio: 'Granddaughter.' },
    { id: '6', name: 'David Smith', gender: 'male' as const, birthDate: '1978-11-20', photo: 'https://picsum.photos/seed/david/200', bio: 'Michael\'s partner.' },
  ];

  let relationships = [
    { id: 'r1', fromId: '1', toId: '2', type: 'spouse' },
    { id: 'r2', fromId: '1', toId: '3', type: 'parent-child' },
    { id: 'r3', fromId: '2', toId: '3', type: 'parent-child' },
    { id: 'r4', fromId: '1', toId: '4', type: 'parent-child' },
    { id: 'r5', fromId: '2', toId: '4', type: 'parent-child' },
    { id: 'r6', fromId: '3', toId: '5', type: 'parent-child' },
    { id: 'r7', fromId: '6', toId: '5', type: 'parent-child' },
    { id: 'r8', fromId: '3', toId: '6', type: 'spouse' },
  ];

  // API Routes
  app.get('/api/data', (req, res) => {
    const { type } = req.query;
    if (type === 'members') return res.json(members);
    if (type === 'relationships') return res.json(relationships);
    res.json({ members, relationships });
  });

  app.post('/api/members', (req, res) => {
    const member = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    members.push(member);
    res.status(201).json(member);
  });

  app.put('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...req.body, id }; // Ensure ID doesn't change
      res.json(members[index]);
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  });

  app.post('/api/relationships', (req, res) => {
    const relationship = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    relationships.push(relationship);
    res.status(201).json(relationship);
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
