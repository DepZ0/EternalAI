import { RegistrationDb } from "../../database/registrationDb";

export class RegistrationService {
  constructor(private registrationDb: RegistrationDb) {}
  public registration = async (email: string, password: string) => {
    const registration = await this.registrationDb.registration(email, password);
    return registration;
  };
}
