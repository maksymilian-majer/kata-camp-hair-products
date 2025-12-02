export type ValidationErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT';

export class ValidationException extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ValidationException';
  }

  static notFound(message: string): ValidationException {
    return new ValidationException('NOT_FOUND', message);
  }

  static conflict(message: string): ValidationException {
    return new ValidationException('CONFLICT', message);
  }

  static unauthorized(message: string): ValidationException {
    return new ValidationException('UNAUTHORIZED', message);
  }

  static invalidInput(message: string): ValidationException {
    return new ValidationException('INVALID_INPUT', message);
  }
}
