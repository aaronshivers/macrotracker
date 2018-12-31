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

// GET /login
describe('GET /login', () => {
  it('should respond with 200', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done)
  })
})

describe('POST /login', () => {
  it('should login user and create a token', (done) => {
    const { email, password } = users[0]
    request(app)
      .post('/login')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(302)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeTruthy()
      })
      .end(done)
  })

  it('should NOT login user if email is not in the database', (done) => {
    const { email, password } = users[2]
    request(app)
      .post('/login')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(404)
      .expect((res) => {
        expect(res.body._id).toBeFalsy()
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end(done)
  })

  it('should NOT login user if password is incorrect', (done) => {
    const { email } = users[0]
    const { password } = users[2]
    request(app)
      .post('/login')
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .expect((res) => {
        expect(res.body._id).toBeFalsy()
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end(done)
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

// DELETE /users/:id
describe('DELETE /users/:id', () => {
  
  it('should delete the specified user', (done) => {
    const { _id } = users[0]
    const cookie = `token=${tokens[0]}`

    request(app)
      .delete(`/users/${ _id }`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toEqual(_id.toString())
      })
      .end((err) => {
        if (err) {
          return done(err)
        } else {
          User.findById(_id).then((user) => {
            expect(user).toBeFalsy()
            done()
          }).catch(err => done(err))
        }
      })
  })

  it('should return 404 if the specified user is not found', (done) => {
    const { _id } = users[2]
    const cookie = `token=${tokens[0]}`

    request(app)
      .delete(`/users/${ _id }`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

