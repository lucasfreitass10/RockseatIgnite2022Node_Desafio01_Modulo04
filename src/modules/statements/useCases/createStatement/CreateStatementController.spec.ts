import { hash } from 'bcryptjs'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { app } from '../../../../app'

let connection: Connection
let authToken: string

describe('CreateStatementController', () => {

  beforeAll(async () => {
    connection = await createConnection()
    //await connection.dropDatabase()
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
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })


  it('should be able to create a deposit statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'test_description'
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.amount).toBe(500)
  })

  it('should be able to create a withdraw statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'test_description'
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.amount).toBe(300)
  })

  it('should not be able to create a withdraw statement whitout funds', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'test_description'
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      })

    expect(response.status).toBe(400)
  })
})