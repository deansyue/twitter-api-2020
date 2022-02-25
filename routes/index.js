const express = require('express')
const router = express.Router()
const { errorHandler } = require('../middleware/error-handler')
const user = require('./modules/user')
const admin = require('./modules/admin')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

router.use('/users', authenticated, user)
router.use('/admin', authenticated, authenticatedAdmin, admin)
router.use('/', errorHandler)

module.exports = router