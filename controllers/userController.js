const jwt = require('jsonwebtoken')
const { imgurFileHandler } = require('../helpers/file-helper')
const { User, Tweet, Like, Reply } = require('../models')
const { getUser } =require('../_helpers')
const bcrypt = require('bcryptjs')


const userController = {
  signIn: (req, res, next) => {
    try {
      if ( req.user.role !== 'user') {
        return res.json({ status: 'error', message: '帳號不存在' })
      }
      const userData = req.user.toJSON()
      // 透過jwt簽發token
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      delete userData.password
      // 傳給用戶端
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    const { account, name, email, password, passwordCheck } = req.body
    // 欄位不能空白
    if (!account || !name || !email || !password || !passwordCheck) {
      return res.json({ status: 'error', message: '欄位不可空白'})
    }
    // password 與 passwordCkeck 不相同
    if (password !== passwordCheck) {
      return res.json({ status: 'error', message: '確認密碼錯誤'})
    }
    // name 字數 < 50
    if (name.length > 50) {
      return res.json({ status: 'error', message: '名稱字數最多 50 字'})
    }
    // account email 已經被使用
    return Promise.all([
      User.findOne({ where: { account }}),
      User.findOne( { where: { email }})
    ])
    .then(([accountUser, emailUser]) => {
      if (accountUser) {
        return res.json({ status: 'error', message: 'account 已重複註冊!'})
      }
      if (emailUser) {
        return res.json({ status: 'error', message: 'email 已重複註冊!'})
      }
      return User.create({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        role: 'user'
      })
    })
    .then(user => {
      res.json({ status: 'success', message: '註冊成功', user})
    })
  },
  // 使用者頁面
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      // raw: true,
      // nest: true,
        include: [
          { model: User, as: "Followings"},
          { model: User, as: "Followers"}
        ]
    })
    .then(user => {
      if (!user) throw new Error("User didn't exist!")
      user.dataValues.followingCount = user.Followings?.length
      user.dataValues.follwerCount = user.Followers?.length
      user.dataValues.isFollowed = user.Followers?.some(id => id === req.currentUser.id)
      res.json(user)
    })
    .catch(err => next(err))
  },
  // 回覆過的推文
  getRepliedTweets: (req, res, next) => {
    return Reply.findAll({
      where: { UserId: req.params.id },
      include: [User, { model: Tweet, include: [{ model: User, attributes: ['name', 'account'] }] }
      ]
     })
    .then(replies => {
      res.json(replies)
    })
    .catch(err => next(err))
  },
  // 使用者推文
   getUserTweets: (req, res, next) => {
    return Tweet.findAll({
      where: { UserId: req.params.id },
      include: [User, Reply, Like],
      order: [['createdAt', 'DESC']]
    })
    .then(tweet => {
      const tweets = tweet.map(tweet => ({
        ...tweet.dataValues,
        likedCount: tweet.Likes.length,
        repliedCount: tweet.Replies.length,
        isLiked: tweet.Likes.map(user => user.UserId).includes(req.currentUser.id)
      }))
      res.json(tweets)
    })
    .catch(err => next(err))
  },
  // 喜歡的推文
   getLikedTweet: (req, res, next) => {
     return Like.findAll({
       where: { UserId: req.params.id },
       include: [{
         model: Tweet,
         include: [{ model: User },
         Reply,
         Like
         ]
       }],
     })
     .then(likes => {
       likes = likes.map(like => ({
         ...like.dataValues,
       }))
       res.json(likes)
    })
    .catch(err => next(err))
  },
  getFollowings: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [{
        model: User, as: 'Followings'
      }]
    })
    .then(user => {
      res.json(user.Followings)
    })
    .catch(err => next(err))
  },
  getFollowers: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [{
        model: User, as: 'Followers'
      }]
    })
    .then(user => {
      res.json(user.Followers)
    })
    .catch(err => next(err))
  },
  // 編輯自介相關資料
  putUser: (req, res, next) => {
    const { name, introduction } = req.body
    // 只能編輯自己的資料
    if (Number(req.params.id) !== req.currentUser.id) {
      return res.json({ status: 'error', message: '權限錯誤'})
    }
    // 修改限制
    if ( name && name.length > 50) {
      return res.json({ status: 'error', message: '名稱字數最多 50 字'})
    }
    if ( introduction && introduction.length > 160) {
      return res.json({ status: 'error', message: '自介字數最多 160 字'})
    }
    
    const { files } = req
    const avatarfile = files.avatar[0]
    const coverfile = files.cover[0]
    
    return Promise.all([
      User.findByPk(req.currentUser.id),
      imgurFileHandler(avatarfile),
      imgurFileHandler(coverfile),
    ])
    .then(([user, avatarPath, coverPath]) => {
      return user.update({
        name,
        introduction,
        avatar: avatarPath || user.avatar,
        cover: coverPath || user.cover,
      })
    })
    .then(user => {
      res.json({ status: 'success', user})
    })
    .catch(err => next(err))
  },
  // 編輯帳號密碼相關資料
  editUser: (req, res, next) => {
    const { account, name, email, password, passwordCheck } = req.body
    // 只能編輯自己的資料
    if (Number(req.params.id) !== req.currentUser.id) {
      return res.json({ status: 'error', message: '權限錯誤'})
    }
    // 欄位不能空白
    if (!account || !name || !email || !password || !passwordCheck) {
      return res.json({ status: 'error', message: '欄位不可空白'})
    }
    // password 與 passwordCkeck 不相同
    if (password !== passwordCheck) {
      return res.json({ status: 'error', message: '確認密碼錯誤'})
    }
    // name 字數 < 50
    if (name.length > 50) {
      return res.json({ status: 'error', message: '名稱字數最多 50 字'})
    }
    // account email 已經被使用
    return Promise.all([
      User.findByPk(req.params.id),
      User.findOne({ where: { account }}),
      User.findOne( { where: { email }})
    ])
    .then(([user, accountUser, emailUser]) => {
      if (accountUser && accountUser.account !== user.account) {
        return res.json({ status: 'error', message: 'account 已重複註冊!'})
      }
      if (emailUser && emailUser.email !== user.email) {
        return res.json({ status: 'error', message: 'email 已重複註冊!'})
      }
      return user.update({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, 10)
      })
    })
    .then(user => {
      res.json({ status: 'success', message: '資料編輯成功', user})
    })
    .catch(err => next(err))
  }


}

module.exports = userController