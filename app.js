// 若非正式上線模式，讀取.env變數
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const passport = require('./config/passport')
const helpers = require('./_helpers');
const router = require('./routes')

const app = express()
const port = process.env.PORT || 3000


// 初始化passport
app.use(passport.initialize())

<<<<<<< HEAD
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// 設定讓外部傳入的 request 可以取得 /upload 路徑
app.use('/upload', express.static(path.join(__dirname, 'upload')))
=======
// use helpers.getUser(req) to replace req.user
function authenticated(req, res, next){
  // passport.authenticate('jwt', { ses...
};
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
>>>>>>> user2

app.use(router)

// app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
