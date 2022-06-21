import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

describe('Get Balance', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository,
    );

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository,
    )
  })

  it('should be able to get the user balance', async () => {
    const user = await usersRepository.create({
      name: 'test_user',
      email: 'user@test.com',
      password: 'test',
    });

    const statementsPromise = [
      createStatementUseCase.execute({
        user_id: user.id!,
        type: 'deposit' as any,
        amount: 500,
        description: 'test_description_1',
      }),
      createStatementUseCase.execute({
        user_id: user.id!,
        type: 'withdraw' as any,
        amount: 100,
        description: 'test_description_2',
      }),
    ];

    await Promise.all(statementsPromise);

    const response = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(response).toHaveProperty('balance');
    expect(response.balance).toBe(400);
  })

  it('should not be able to get the user balance if the user does not exists', async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: 'test_user_id' }),
    ).rejects.toBeInstanceOf(GetBalanceError);
  })
})