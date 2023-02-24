const { createCategory } = require('../../Controllers/Category/Category')
const { requireSignin } = require('../../Middlewares/middleware')

const router = require('express').Router()

router.post('/create', requireSignin, createCategory)

module.exports = router
