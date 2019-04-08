const createError = require('http-errors')
const express = require('express')
const Users = require('../model/users')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')

var router = express.Router()

router.get('/auth/sign-in', function(req, res, next) {
  res.render('sign-in')
})

router.post('/auth/sign-in', async function(req, res, next) {
  var handle = req.body.handle
  if (!handle) {
    return next(createError(400, 'missing handle'))
  }
  var password = req.body.password
  if (!password) {
    return next(createError(400, 'missing password'))
  }

  try {
    await Users.validateUser(handle, password)
    setSignedInCookie(res, handle)
    res.redirect('/')
  } catch (exception) {
    return next(createError(401, exception.message))
  }
})

function setSignedInCookie(res, handle) {
  const token = jwt.sign({ handle: handle }, Users.JWT_SECRET)

  res.setHeader('Set-Cookie', cookie.serialize('token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // expire in 1 week
    sameSite: 'strict',
    path: '/',
  }))
}

router.get('/auth/sign-out', function(req, res, next) {
  res.setHeader('Set-Cookie', cookie.serialize('token', ' ', {
    httpOnly: true,
    maxAge: 0, // expire immediately
    path: '/',
  }))

  res.redirect('/')
})

router.get('/auth/sign-up', function(req, res, next) {
  res.render('sign-up')
})

router.post('/auth/sign-up', async function(req, res, next) {
  var handle = req.body.handle
  if (!handle) {
    return next(createError(400, 'missing handle'))
  }
  var password = req.body.password
  if (!password) {
    return next(createError(400, 'missing password'))
  }

  try {
    await Users.createUser(handle, password)

    setSignedInCookie(res, handle)

    res.redirect('/')
  } catch (exception) {
    return next(exception)
  }
})

module.exports = router
