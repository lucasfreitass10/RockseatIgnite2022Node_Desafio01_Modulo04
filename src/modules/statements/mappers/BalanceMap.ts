import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      transfer,
    }) => {
      if (transfer) {
        return {
          id: transfer.id,
          sender_id: transfer.sender_id,
          amount: amount,
          description: description,
          type: "transfer",
          created_at: created_at,
          updated_at: updated_at
        }
      }
      return {
        id,
        amount: amount,
        description,
        type,
        created_at,
        updated_at
      }
    });

    return {
      statement: parsedStatement,
      balance: balance
    }
  }
}