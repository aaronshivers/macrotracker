const expect = require('expect')
const request = require('supertest')

const app = require('./../app')
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

