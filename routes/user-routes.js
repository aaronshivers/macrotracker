const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user-model')
const validatePassword = require('../middleware/validate-password')
const createToken = require('../middleware/create-token')
const authenticateUser = require('../middleware/authenticate-user')
const authenticateAdmin = require('../middleware/authenticate-admin')

const cookieExpiration = { expires: new Date(Date.now() + 86400000) }

// GET /signup
router.get('/signup', (req, res) => {
  res.render('signup')
})

// POST /users
router.post('/users', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const newUser = { email, password }
  const user = new User(newUser)

  if (!password || !email) return res.status(400).render('error', {
    statusCode: '400',
    errorMessage: 'You must provide an email, and a password.'
  })

  if (validatePassword(newUser.password)) {
    user.save().then((user) => {
      createToken(user).then((token) => {
        res.cookie('token', token, cookieExpiration).status(201).render(`profile`, { user })
      }).catch(err => res.status(500).send(err.message))
    }).catch(err => res.status(400).send(err.message))
  } else {
    res.status(400).send('Password must contain 8-100 characters, with at least one lowercase letter, one uppercase letter, one number, and one special character.')
  }
})

// GET /profile
router.get('/profile', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)
  const { _id } = decoded

  User.findById(_id).then((user) => {
    if (user) {
      res.render('profile', { user })
    } else {
      res.status(401).render('error', {
        statusCode: '401',
        errorMessage: 'Sorry, you must be logged in to view this page.'
      })
    }
  })
})

// GET /login
router.get('/login', (req, res) => {
  res.render('login')
})

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  User.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          createToken(user).then((token) => {
            res.cookie('token', token, cookieExpiration).status(200).redirect(`/profile`)
          })
        } else {
          res.status(401).render('error', {
            statusCode: '401',
            errorMessage: 'Please check your login credentials, and try again.'
          })
        }
      })
    } else {
      res.status(404).render('error', {
        statusCode: '401',
        errorMessage: 'Sorry, we could not find that user in our database.'
      })
    }
  }).catch(err => res.status(401).send('Please check your login credentials, and try again.'))
})

// GET /logout
router.get('/logout', (req, res) => {
  res.clearCookie('token').redirect(`/`)
})

module.exports = router
