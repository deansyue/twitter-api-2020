const jwt = require('jsonwebtoken')
const { User, Tweet, Like, Reply } = require('../models')
const { getUser } =require('../_helpers')

const adminController = {
  signIn: (req, res, next) => {
    try {
      if ( req.user.role !== 'admin') {
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
  getUsers: (req, res, next) => {
    return User.findAll({
      include: [
        Reply,
        { model: Tweet, include: Like },
        { model: User, as: "Followings" },
        { model: User, as: "Followers" },
      ],
      attributes: ['name', 'avatar', 'cover']
    })
    .then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        followingCount: user.dataValues.Followings.length,
        followersCount: user.dataValues.Followers.length,
        // likedCount: ,
        tweetCount: user.dataValues.Tweets.length
      }))
      users.sort((a, b) => b.tweetCount - a.tweetCount)
      return res.json(users)
    })
    .catch(err => next(err))
  },
  getTweets: (req, res, next) => {
    return Tweet.findAll({
      include: User,
      order: [['createdAt', 'DESC']]
    })
    .then(tweet => {
      tweet = tweet.map(t => ({
      ...t.dataValues,
      description: t.description.substring(0, 50)
      }))
      return res.json(tweet)
    })
  },
  deleteTweet: (req, res, next) => {
    Tweet.destroy({ where: { id: req.params.id } })
      .then(res.json({ status: 'success', message: '成功刪除'}))
      .catch(err => next(err))
  }
}

module.exports = adminController