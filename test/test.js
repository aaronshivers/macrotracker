const expect = require('expect')
const request = require('supertest')

const app = require('./../app')



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


