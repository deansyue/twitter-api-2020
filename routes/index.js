const express = require('express')
const router = express.Router()
const apis = require('./apis')
const { errorHandler } = require('../middleware/error-handler')

router.use('/api', apis)
router.use('/', errorHandler)

module.exports = router