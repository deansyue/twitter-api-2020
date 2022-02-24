const { User, Tweet, Like, Reply } = require('../models')
const { getUser } =require('../_helpers')


const userController = {
  // 使用者頁面
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      raw: true,
      nest: true,
        include: [
          { model: User, as: "Followings"},
          { model: User, as: "Followers"}
        ]
    })
    .then(user => {
      if (!user) throw new Error("User didn't exist!")
      const followingCount = user.Followings?.length || 0
      const follwerCount = user.Followers?.length || 0
      // const isFollowed = user.Followers?.some(id => id === getUser(req).id) || 0
      const data = {
        user: user,
        followingCount,
        follwerCount,
        // isFollowed
      }
      res.json({
        status: 'success',
        data
      })
    })
    .catch(err => next(err))
  },
  // 回覆過的推文
  getRepliedTweets: (req, res, next) => {
    return Reply.findAll({
      Where: { UserId: req.params.id },
      include: [User, { model: Tweet, include: [{ model: User, attributes: ['name', 'account'] }] }
      ],
      raw: true,
      nest: true
     })
    .then(replies => {
      const data = { replies }
      res.json({
        status: 'success',
        data
      })
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
      // tweets = tweets.map(tweet => {
      //   ...tweet.dataValues,
      //   likedCount: tweet.Likes.length,
      //   repliedCount: tweet.Replies.length,
      //   isLiked: tweet.Likes.map(user => user.UserId).includes(req.user.id)
      // })
      const data = {
        tweet,
        // likedCount: tweet.Likes.length,
        // repliedCount: tweet.Replies.length
      }
      res.json({
        status: 'success',
        data: data
      })
    })
    .catch(err => next(err))
  },
  // 喜歡的推文
   getLikedTweet: (req, res, next) => {
    return Promise.all([
      User.findByPk(req.params.id, {
        include: [
          { model: Like, include: Tweet},
        ],
        raw: true,
        nest: true
      }),
      Like.findAll({
        Where: { UserId: req.params.id },
        include: [
          { model: Tweet, include: [ //後端的優化!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            { model: Like },
            { model: User },
            { model: Reply }
          ] },
        ],
      raw: true,
      nest: true
     })
    ])
    .then(([user, like]) => {
      if (!user) throw new Error("User didn't exist!")
      const likedTweet = like.Tweet // 傳回喜歡的推特陣列
      const likedCount = like.Tweet.Like.length
      const repliedCount = like.Tweet.Reply.length
      const data = {
        user,
        likedTweet,
        likedCount,
        repliedCount
      }
      res.json({
        status: 'success',
        data
      })
    })
    .catch(err => next(err))
  }

}

module.exports = userController