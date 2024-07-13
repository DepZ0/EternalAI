export class BadRequestError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
