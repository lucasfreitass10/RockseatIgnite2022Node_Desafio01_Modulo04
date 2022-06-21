import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

describe('Get Statement Operation', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository,
    )

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository,
    )
  })

  it('should be able to get the user statement operation using user_id and statement_id', async () => {
    const user = await usersRepository.create({
      name: 'test_user',
      email: 'user@test.com',
      password: 'test',
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      type: 'deposit' as any,
      amount: 500,
      description: 'test_description',
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    })

    expect(statementOperation).toHaveProperty('id');
  })

  it('should not be able to get the user statement operation if the user does not exist', async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: 'test_user_id',
        statement_id: 'test_statement_id',
      }),
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get the user statement operation if the statement does not exist', async () => {
    const user = await usersRepository.create({
      name: 'test_user',
      email: 'user@test.com',
      password: 'test',
    })

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: 'test_statement_id',
      }),
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })

})