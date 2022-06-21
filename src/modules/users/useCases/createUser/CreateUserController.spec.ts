import request from "supertest"
import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"

let con: Connection

describe('AuthenticateUserController', () => {

  beforeAll(async () => {
    con = await createConnection()
    await con.runMigrations()
  })

  afterAll(async () => {
    await con.dropDatabase()
    await con.close()
  })


  it('should be able to authenticate', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'test_user',
        email: 'user@test.com',
        password: 'test'
      })

    expect(response.status).toBe(201)
  })

})