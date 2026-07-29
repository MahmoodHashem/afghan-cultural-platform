import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

import type { RequestWithId } from "@/common/types/request-with-id.type";

type FieldError = {
  field: string;
  message: string;
};

type StandardErrorBody = {
  error: {
    code: string;
    message: string;
    fieldErrors: FieldError[];
  };
  requestId: string;
  timestamp: string;
};

type NestValidationResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

@Catch()
class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const isProduction = process.env.NODE_ENV === "production";

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        "Unexpected application error",
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(
      this.createErrorBody({
        exception,
        requestId: request.requestId ?? "unknown",
        timestamp: new Date().toISOString(),
        isProduction,
      }),
    );
  }

  private createErrorBody({
    exception,
    requestId,
    timestamp,
    isProduction,
  }: {
    exception: unknown;
    requestId: string;
    timestamp: string;
    isProduction: boolean;
  }): StandardErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: isProduction
            ? "Internal server error"
            : this.getUnexpectedErrorMessage(exception),
          fieldErrors: [],
        },
        requestId,
        timestamp,
      };
    }

    const response = exception.getResponse();
    const status = exception.getStatus();
    const code = this.createErrorCode(response, status);
    const message = this.createErrorMessage(response, exception.message);

    return {
      error: {
        code,
        message,
        fieldErrors: this.createFieldErrors(response),
      },
      requestId,
      timestamp,
    };
  }

  private createErrorCode(response: string | object, status: number): string {
    if (typeof response === "object" && "error" in response && typeof response.error === "string") {
      return response.error.toUpperCase().replaceAll(" ", "_");
    }

    return HttpStatus[status] ?? "HTTP_ERROR";
  }

  private createErrorMessage(response: string | object, fallback: string): string {
    if (typeof response === "string") {
      return response;
    }

    const validationResponse = response as NestValidationResponse;

    if (Array.isArray(validationResponse.message)) {
      return "Validation failed";
    }

    return validationResponse.message ?? fallback;
  }

  private createFieldErrors(response: string | object): FieldError[] {
    if (typeof response === "string") {
      return [];
    }

    const validationResponse = response as NestValidationResponse;

    if (!Array.isArray(validationResponse.message)) {
      return [];
    }

    return validationResponse.message.map((message) => ({
      field: this.extractFieldName(message),
      message,
    }));
  }

  private extractFieldName(message: string): string {
    const nonWhitelistedField = message.match(/^property\s+([^\s]+)\s+should not exist$/);

    if (nonWhitelistedField?.[1]) {
      return nonWhitelistedField[1];
    }

    const [field] = message.split(" ");

    return field?.replaceAll('"', "") ?? "unknown";
  }

  private getUnexpectedErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }

    return "Unexpected error";
  }
}

export type { FieldError, StandardErrorBody };
export { HttpExceptionFilter };
