import { hash } from 'bcryptjs'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { app } from '../../../../app'

let connection: Connection
let authToken: string
let depositId: string

describe('GetStatementOperationController', () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.dropDatabase()
    await connection.runMigrations()

    const password = await hash('test', 8)

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${uuid()}', 'test_user', 'user@test.com', '${password}', 'now()', 'now()')
      `
    )

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'test',
    })

    authToken = responseToken.body.token

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 300,
        description: 'test_description'
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    depositId = deposit.body.id
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })


  it('should be able to show the user statement', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${depositId}`)
      .send()
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(depositId)
  })

  it('should not be able to show a statement from a non-authorized user', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${depositId}`)
      .send()
      .set({
        Authorization: '',
      })

    expect(response.status).toBe(401)
  })

  it('should not be able to show a non-existing user statement', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .send()
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    expect(response.status).toBe(404)
  })

})