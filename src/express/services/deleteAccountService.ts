import { DeleteAccountDb } from "../../database/deleteAccountDb";

export class DeleteAccountService {
  constructor(private deleteAccountDb: DeleteAccountDb) {}

  public deleteAccount = async (userId: number) => {
    await this.deleteAccountDb.deleteAccount(userId);
  };
}
