import { GoogleAuthDb } from "../../database/googleAuthDb";

export class GoogleAuthService {
  constructor(private googleAuthDb: GoogleAuthDb) {}

  public googleAuth = async (googleId: string, email: string, userAgent: string) => {
    const googleAuth = await this.googleAuthDb.googleAuth(googleId, email, userAgent);
    return googleAuth;
  };
}
