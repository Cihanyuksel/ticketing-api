//AppError - Base Error Class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

//ValidationError - 400 Bad Request
export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

// NotFoundError - 404 Not Found
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} bulunamadı (ID: ${id})`
      : `${resource} bulunamadı`;
    super(message, 404);
  }
}

// UnauthorizedError - 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = "Kimlik doğrulama gerekli") {
    super(message, 401);
  }
}

//ForbiddenError - 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = "Bu işlem için yetkiniz yok") {
    super(message, 403);
  }
}

//ConflictError - 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

//InternalServerError - 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message: string = "Sunucu hatası") {
    super(message, 500, false);
  }
}
