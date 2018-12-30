require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const methodOverride = require('method-override')

const app = express()
const { PORT } = process.env

const userRoutes = require('./routes/user-routes')
const mealRoutes = require('./routes/meal-routes')

app.set('view engine', 'ejs')

app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use(userRoutes)
app.use(mealRoutes)

app.get('/', (req, res) => res.render('home'))

app.use((req, res, next) => {
  res.status(404).send('Sorry, we cannot find that!')
})

app.use((err, req, res, next) => {
  res.status(500).send(err.message)
})

app.listen(PORT)

module.exports = app
