import { ChangeProfileDetailsDb } from "../../database/changeProfileDetailsDb";

export class ChangeProfileDetailsService {
  constructor(private changeProfileDetailsDb: ChangeProfileDetailsDb) {}

  public changeDetails = async (
    id: number,
    email: string,
    password: string,
    phone: string
  ): Promise<{ error?: string; message?: string }> => {
    const changeDetails = await this.changeProfileDetailsDb.changeProfileDetails(id, email, password, phone);
    return changeDetails;
  };
}
