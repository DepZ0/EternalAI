import { ProfileDb } from "../../database/profileDb";

export class ProfileService {
  constructor(private profileDb: ProfileDb) {}

  public findProfile = async (userId: number): Promise<any> => {
    try {
      return await this.profileDb.findPofile(userId);
    } catch (error) {
      return { error: error.message };
    }
  };
}
