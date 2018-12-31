const expect = require('expect')
const request = require('supertest')

const app = require('./../app')
const User = require('../models/user-model')
const { users, populateUsers, tokens } = require('./seed')

beforeEach(populateUsers)

// GET /
describe('GET /', () => {
  it('should respond with 200', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done)
  })
})

// GET /signup
describe('GET /signup', () => {
  it('should respond with 200', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done)
  })
})

// GET /profile
describe('GET /profile', () => {
  it('should respond with 200, if logged in', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .get('/profile')
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond with 401, if NOT logged in', (done) => {
    request(app)
      .get('/profile')
      .expect(401)
      .end(done)
  })
})

// POST /users
describe('POST /users', () => {

  it('should create a new user, and redirect to /profile', (done) => {
    const { email, password } = users[2]

    request(app)
      .post('/users')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(201)
      .expect((res) => {
        expect(res.text).toContain(email)
        expect(res.header).toHaveProperty('set-cookie')
        // expect(res.header['set-cookie']).toBeTruthy()
      })
      .end((err) => {
        if (err) {
          return done(err)
        } else {
          User.findOne({email}).then((user) => {
            expect(user).toBeTruthy()
            expect(user.email).toEqual(email)
            expect(user.password).not.toEqual(password)
            done()
          }).catch(err => done(err))
        }
      })
  })

  it('should NOT create a duplicate user', (done) => {
    const { email, password } = users[0]

    request(app)
      .post('/users')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end(done)
  })

  it('should NOT create a user with an invalid email', (done) => {
    const { email, password } = users[3]

    request(app)
      .post('/users')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end((err) => {
        if (err) {
          return done(err)
        } else {
          User.findOne({email}).then((user) => {
            expect(user).toBeFalsy()
            done()
          }).catch(err => done(err))
        }
      })
  })

  it('should NOT create a user with an invalid password', (done) => {
    const { email, password } = users[4]
    request(app)
      .post('/users')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end((err) => {
        if (err) {
          return done(err)
        } else {
          User.findOne({email}).then((user) => {
            expect(user).toBeFalsy()
            done()
          }).catch(err => done(err))
        }
      })
  })
})

// GET /logout
describe('GET /logout', () => {
  it('should logout user and delete auth token', (done) => {
    const cookie = `token=${tokens[0]}`
    request(app)
      .get('/logout')
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
      })
      .end(done)
  })
})
