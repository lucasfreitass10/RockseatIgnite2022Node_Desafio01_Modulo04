import { injectable, inject } from "tsyringe";

import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

@injectable()
export class ShowUserProfileUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute(user_id: string) {
    try {
      const user = await this.usersRepository.findById(user_id);

      if (!user) {
        throw new ShowUserProfileError();
      }

      return user;
    } catch (error) {
      throw new ShowUserProfileError();
    }

  }
}
