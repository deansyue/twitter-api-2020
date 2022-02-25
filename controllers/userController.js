const { User, Tweet, Like, Reply } = require('../models')
const { getUser } =require('../_helpers')


const userController = {
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
      const followingCount = user.Followings?.length
      const follwerCount = user.Followers?.length
      // const isFollowed = user.Followers?.some(id => id === req.user.id)
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
      const tweets = tweet.map(tweet => ({
        ...tweet.dataValues,
        likedCount: tweet.Likes.length,
        repliedCount: tweet.Replies.length,
        // isLiked: tweet.Likes.map(user => user.UserId).includes(req.user.id)
      }))
      const data = {
        tweets,
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
       res.json({
        status: 'success',
        data: likes
      })
    })
    .catch(err => next(err))
  },
  getFollowings: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [{
        model: User, as: 'Followings'
      }]
    })
    .then(followings => {
      res.json({
        status: 'success',
        data: followings
      })
    })
    .catch(err => next(err))
  },
  getFollowers: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [{
        model: User, as: 'Followers'
      }]
    })
    .then(followers => {
      res.json({
        status: 'success',
        data: followers
      })
    })
    .catch(err => next(err))
  }


}

module.exports = userController