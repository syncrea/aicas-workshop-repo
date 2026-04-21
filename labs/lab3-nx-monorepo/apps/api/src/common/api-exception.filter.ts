import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError, ApiErrorCode } from '@aicas/shared-types';

/**
 * Catches every uncaught exception and renders it as the canonical
 * {@link ApiError} envelope. Anything thrown from a controller or service
 * eventually flows through this filter, so the wire format is consistent.
 *
 * Status codes map to {@link ApiErrorCode}s as follows; anything else
 * collapses to `internal_error`. Validation pipe failures are special-cased
 * so the field-level details are surfaced under `details.fields`.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      const code = this.codeForStatus(status);
      const { message, details } = this.normalizePayload(responseBody);

      const apiError: ApiError = {
        statusCode: status,
        message,
        code,
        details,
      };

      response.status(status).json(apiError);
      return;
    }

    this.logger.error('Unhandled exception in request pipeline', exception as Error);
    const apiError: ApiError = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'internal_error',
      details: null,
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiError);
  }

  private codeForStatus(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'not_found';
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'validation_failed';
      case HttpStatus.CONFLICT:
        return 'conflict';
      default:
        return 'internal_error';
    }
  }

  private normalizePayload(payload: string | object): {
    message: string;
    details: Record<string, unknown> | null;
  } {
    if (typeof payload === 'string') {
      return { message: payload, details: null };
    }
    const obj = payload as { message?: string | string[]; error?: string };
    if (Array.isArray(obj.message)) {
      // class-validator produces { message: string[], error, statusCode }
      return {
        message: obj.error ?? 'Validation failed',
        details: { fields: obj.message },
      };
    }
    return {
      message: obj.message ?? obj.error ?? 'Request failed',
      details: null,
    };
  }
}
