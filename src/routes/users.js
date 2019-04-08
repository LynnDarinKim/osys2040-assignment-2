const express = require('express')
const Users = require('../model/users')

const router = express.Router()

/* GET users listing. */
router.get('/users', async function(req, res, next) {
  const users = await Users.getUsers()

  const handles = users.map(function(user) {
    return user.handle
  })

  res.render('users', {
    users: handles,
  })
})

module.exports = router
