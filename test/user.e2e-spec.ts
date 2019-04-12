import request from 'supertest'
import server from '../src/server'
import { Server } from 'http'

describe('Auth API (e2e)', () => {
  let testserver: Server
  let token: string

  beforeAll(async () => {
    testserver = await server.start()
  })

  afterAll(async () => {
    // Cleanup database
    await testserver.close()
  })

  describe('Key generation', () => {
    it('shuold be able to generate key', done => {
      return request(testserver)
        .post('/')
        .send({
          operationName: undefined,
          query: `
            mutation {
              rotateKey
            }
          `,
          variables: {}
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          const { data } = res.body
          expect(data.rotateKey).toBeDefined()
          done()
        })
    })
  })

  describe('Authentification', () => {
    it('shuold be able to create user', done => {
      return request(testserver)
        .post('/')
        .send({
          operationName: undefined,
          query: `
            mutation {
              signup(
                email: "user.name@example.com"
                name: "User Name"
                password: "yourpass"
              ) {
                token
                user {
                  name
                }
              }
            }
          `,
          variables: {}
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          const { data } = res.body
          expect(data.signup).toBeDefined()
          expect(data.signup.token).toBeDefined()
          token = 'Bearer ' + data.signup.token
          done()
        })
    })

    it('shuold be able to log in with that user', done => {
      return request(testserver)
        .post('/')
        .send({
          operationName: undefined,
          query: `
            mutation {
              login(
                email: "user.name@example.com"
                password: "yourpass"
              ) {
                token
                user {
                  name
                }
              }
            }
          `,
          variables: {}
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          const { data } = res.body
          expect(data.login).toBeDefined()
          expect(data.login.token).toBeDefined()
          token = 'Bearer ' + data.login.token
          done()
        })
    })

    it('should forbid to create company without token', done => {
      return request(testserver)
        .post('/')
        .send({
          operationName: undefined,
          query: `
            mutation {
              createCompany(
                name: "My first company"
                homepage: "www.company.com"
              ) {
                name
              }
            }
          `,
          variables: {}
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          const { data, errors } = res.body
          expect(errors[0]).toBeDefined()
          expect(errors[0].message).toBeDefined()
          expect(errors[0].message).toEqual('Not authenticated')
          done()
        })
    })

    it('should allow to create company with token', done => {
      return request(testserver)
        .post('/')
        .set('Authorization', token)
        .send({
          operationName: undefined,
          query: `
            mutation {
              createCompany(
                name: "My first company"
                homepage: "www.company.com"
              ) {
                name
              }
            }
          `,
          variables: {}
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          const { data } = res.body
          expect(data).toBeDefined()
          expect(data.createCompany).toBeDefined()
          expect(data.createCompany.name).toBeDefined()
          expect(data.createCompany.name).toEqual('My first company')
          done()
        })
    })
  })
})
