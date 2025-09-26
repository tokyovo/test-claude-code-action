const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let todos = [
  { id: 1, text: 'Learn about Claude Code Action', completed: false },
  { id: 2, text: 'Test @claude mentions in PRs', completed: false },
  { id: 3, text: 'Try automated code reviews', completed: false }
];

let nextId = 4;

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed } = req.body;

  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (text !== undefined) {
    todos[todoIndex].text = text.trim();
  }

  if (completed !== undefined) {
    todos[todoIndex].completed = completed;
  }

  res.json(todos[todoIndex]);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;

  todos = todos.filter(todo => todo.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(204).send();
});

app.get('/api/todos/stats', (req, res) => {
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length
  };
  res.json(stats);
});

app.get('/api/todos/export', (req, res) => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTodos: todos.length,
    todos: todos
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `todos-export-${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(exportData);
});

app.delete('/api/todos', (req, res) => {
  const { completed } = req.query;

  if (completed === 'true') {
    todos = todos.filter(todo => !todo.completed);
    res.json({ message: 'Completed todos deleted', remaining: todos.length });
  } else {
    todos = [];
    nextId = 1;
    res.json({ message: 'All todos deleted' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Todo app server running on http://localhost:${PORT}`);
});