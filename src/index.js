const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function userExists(username){
  const userExist = users.find((user) => user.username === username );
  return userExist;
}

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = userExists(username);

  if(!user){
    return response.send(404).json({error: "Username not found"})
  }

  request.user = user;

  return next();

};

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  if(userExists(username)){
    return response.status(400).json({error: "Username already exists!"})
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at : new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title,deadline} = request.body;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo not found"});
  }

  todo.title = title;
  todo.deadline =  new Date (deadline);

  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo not found"});
  }

  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: "Todo not found"});
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;