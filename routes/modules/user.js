const express = require('express')
const passport = require('../../config/passport')
const userController = require('../../controllers/userController')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const upload = require('../../middleware/multer')

//登入註冊功能
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/', userController.signUp)

// user
router.get('/users/:id/replied_tweets', userController.getRepliedTweets)
router.get('/users/:id/tweets', authenticated, userController.getUserTweets)
router.get('/users/:id/likes', authenticated, userController.getLikedTweet)
router.get('/users/:id/followings', authenticated, userController.getFollowings)
router.get('/users/:id/followers', authenticated, userController.getFollowers)
router.put('/users/:id', authenticated, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1}]), userController.putUser)
router.put('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/', (req, res) => res.send('Hello World!'))

module.exports = router