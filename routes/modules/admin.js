const express = require('express')
const passport = require('../../config/passport')
const adminController = require('../../controllers/adminController')
const router = express.Router()
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')

// admin 
router.post('/signin', passport.authenticate('local', { session: false }), adminController.signIn)
router.get('/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.get('/tweets', authenticated, authenticatedAdmin, adminController.getTweets)
router.delete('/tweets/:id', authenticated, authenticatedAdmin, adminController.deleteTweet)


module.exports = router