const express = require('express')
const router = express.Router()

const Item = require('../models/item-model')
const authenticateUser = require('../middleware/authenticate-user')
const verifyCreator = require('../middleware/verify-creator')

router.get('/items', authenticateUser, (req, res) => {
  const { token } = req.cookies

  verifyCreator(token).then((creator) => {
    Item.find({ creator }).then((items) => {
      res.render('items', { items })
    })
  })
})

router.get('/items/new', authenticateUser, (req, res) => {
  res.render('new-item')
})

router.post('/items', authenticateUser, (req, res) => {
  const { token } = req.cookies

  verifyCreator(token).then((creator) => {
    const { title, calories, fat, carbs, protien } = req.body
    const newItem = { title, calories, fat, carbs, protien, creator }
    const item = new Item(newItem)
  
    item.save().then(() => {
      res.redirect('/items')
    })
  })
})

router.get('/items/:id/edit', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  verifyCreator(token).then((creator) => {
    Item.findOne({ _id, creator }).then((item) => {
      res.render('edit-item', { item })
    })
  })
})

router.patch('/items/:id', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id
  const { title, calories, fat, carbs, protien, favorite } = req.body
  const updatedItem = { title, calories, fat, carbs, protien, favorite }

  verifyCreator(token).then((creator) => {
    const conditions = { _id, creator }

    Item.findOneAndUpdate(conditions, updatedItem).then(() => {
      res.redirect('/items')
    })
  })
})

router.delete('/items/:id', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id
  

  verifyCreator(token).then((creator) => {
    const conditions = { _id, creator }

    Item.findOneAndDelete(conditions).then((item) => {
      res.redirect('/items')
    })
  })
})

module.exports = router
