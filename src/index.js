const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: 'User not found!' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const user = request.body;
  const userAlreadyExist = users.some(s => s.username === user.username);

  if(userAlreadyExist) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push(
    {
      id: uuidv4(),
      name: user.name,
      username: user.username,
      todos: []
    }
  );

  return response.status(201).json(users.find(f => f.username === user.username));
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const uuid = uuidv4();

  user.todos.push({
    id: uuid,
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).json(user.todos.find(f => f.id === uuid));
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoToEdit = user.todos.find(f => f.id === id);

  if(!todoToEdit) {
    return response.status(404).json({ error: "ID not found!"})
  }

  todoToEdit.title = title;
  todoToEdit.deadline = new Date(deadline);

  return response.status(200).json(user.todos.find(f => f.id === id));
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todoToEdit = user.todos.find(f => f.id === id);

  if(!todoToEdit) {
    return response.status(404).json({ error: "ID not found!" });
  }

  todoToEdit.done = true;

  return response.status(200).json(todoToEdit);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const todoToDelete = user.todos.find(f => f.id === id);

  if(!todoToDelete) {
    return response.status(404).json({ error: "ID not found!" });
  }
  
  user.todos.splice(todoToDelete, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;