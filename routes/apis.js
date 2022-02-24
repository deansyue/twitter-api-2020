const express = require('express')
const userController = require('../controllers/userController')
const router = express.Router()

router.get('/users/:id/replied_tweets', userController.getRepliedTweets)
router.get('/users/:id/tweets', userController.getUserTweets)
router.get('/users/:id/likes', userController.getLikedTweet)
router.get('/users/:id/followings', userController.getFollowings)
router.get('/users/:id/followers', userController.getFollowers)
router.get('/users/:id', userController.getUser)
router.get('/', (req, res) => res.send('Hello World!'))

module.exports = router
