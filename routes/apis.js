const express = require('express')
const passport = require('../config/passport')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const router = express.Router()
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const upload = require('../middleware/multer')

//登入註冊功能
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)

// admin 
router.post('/admin/signin', passport.authenticate('local', { session: false }), adminController.signIn)
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.get('/admin/tweets', authenticated, authenticatedAdmin, adminController.getTweets)
router.delete('/admin/tweets/:id', authenticated, authenticatedAdmin, adminController.deleteTweet)

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
