import { inject, injectable } from "tsyringe";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferRepository } from '../../repositories/ITransferRepository'
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateTransferError } from "./CreateTransferError";
import { OperationType } from "../../entities/Statement";

interface IRequest {
  sender_id: string
  receiver_id: string
  amount: number
  description: string
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementRepository: IStatementsRepository,
    @inject('TransferRepository')
    private transferRepository: ITransferRepository
  ) { }
  async execute({ sender_id, receiver_id, amount, description }: IRequest) {
    const [sender_user, recipient_user] = await Promise.all([
      this.usersRepository.findById(sender_id),
      this.usersRepository.findById(receiver_id)
    ]);

    if (!sender_user || !recipient_user) {
      throw new CreateTransferError.UserNotFound();
    }

    const senderBalance = await this.statementRepository.getUserBalance({ user_id: sender_id })
    if (senderBalance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const transfer = await this.transferRepository.create({
      sender_id,
      receiver_id
    });

    const [transferWithdraw] = await Promise.all([
      this.statementRepository.create({
        transfer_id: transfer.id,
        user_id: sender_id,
        description,
        amount,
        type: OperationType.WITHDRAW
      }),
      this.statementRepository.create({
        transfer_id: transfer.id,
        user_id: receiver_id,
        description,
        amount,
        type: OperationType.DEPOSIT
      })
    ]);

    const response = {
      id: transferWithdraw.id,
      sender_id,
      amount,
      description,
      type: 'transfer',
      created_at: transferWithdraw.created_at,
      updated_at: transferWithdraw.updated_at
    }

    return response;
  }
}

export { CreateTransferUseCase }
