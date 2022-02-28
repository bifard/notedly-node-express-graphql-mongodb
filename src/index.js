// index.js
// This is the main entry point of our application
require('dotenv').config();
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const {ApolloServer} = require('apollo-server-express');
const express = require('express');
const models = require('./models');

//Функции распознаватели
const resolvers = require('./resolvers')

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

//SHEMA
const typeDefs = require('./shema');



const app = express();
app.use(helmet());
app.use(cors());

db.connect(DB_HOST);  //Подключаемся к БД
const getUser = token => {
  if(token){
    try{
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      new Error('Session invalid');
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({req})=> {
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log(user);
    return {models, user};
  }
});

server.applyMiddleware({app, path: '/api'});


app.listen({port}, () => 
  console.log(`GraphQL Server running at http://localhost:${port}${server.graphqlPath}`)
);