const express = require('express')
const helpers = require('./_helpers');
const router = require('./routes')

const app = express()
const port = 3000

// use helpers.getUser(req) to replace req.user
function authenticated(req, res, next){
  // passport.authenticate('jwt', { ses...
};
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(router)

// app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
