import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let authenticateUserUseCase: AuthenticateUserUseCase
let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it('should be able to authenticate a user with email and password', async () => {
    await createUserUseCase.execute({
      name: 'test_name',
      email: 'user@test.com',
      password: 'teste'
    });

    const response = await authenticateUserUseCase.execute({
      email: 'user@test.com',
      password: 'teste',
    });

    expect(response).toHaveProperty('token');
  });
  
  it('should not be able to authenticate with a non-existent user', async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: 'non-existent@email.com',
        password: 'any_password'
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not be able to authenticate with an incorrect password', async () => {
    await createUserUseCase.execute({
      name: 'test_user',
      email: 'user@test.com',
      password: 'test',
    })

    await expect(
      authenticateUserUseCase.execute({
        email: 'user@test.com',
        password: 'incorrect_password'
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})