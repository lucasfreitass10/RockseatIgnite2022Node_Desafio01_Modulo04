import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { IUsersRepository } from '../../repositories/IUsersRepository'
import { CreateUserError } from './CreateUserError'
import { CreateUserUseCase } from './CreateUserUseCase'

let createUserUseCase: CreateUserUseCase
let usersRepository: IUsersRepository

describe('Create User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'test_user', email: 'user@test.com', password: 'test'
    })

    expect(user).toHaveProperty('id')
  })

  it('should not be able to create a new user with an existing email', async () => {
    await createUserUseCase.execute({
      name: 'test_user1', email: 'user1@test.com', password: 'test'
    })

    await expect(
      createUserUseCase.execute({
        name: 'test_user11', email: 'user1@test.com', password: 'test'
      })
    ).rejects.toBeInstanceOf(CreateUserError)
  })
})