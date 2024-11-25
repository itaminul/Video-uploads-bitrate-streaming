import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  BadRequestException,
  HttpStatus,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { format } from "date-fns";

export type Response<T> = {
  status: boolean;
  statusCode: number;
  path: string;
  message: string;
  data?: T;
  errors?: any; // Capture errors if present
  timestamp: string;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => this.responseHandler(res, context)),
      catchError((err) => {
        if (err instanceof BadRequestException) {
          return throwError(() => this.handleValidationError(err, context));
        }
        return throwError(() => this.errorHandler(err, context));
      })
    );
  }

  handleValidationError(
    exception: BadRequestException,
    context: ExecutionContext
  ) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;
    const responseBody: any = exception.getResponse();
    const errors = responseBody?.errors || 'Validation errors are not available';
    return response.status(status).json({
      status: false,
      statusCode: status,
      path: request.url,
      message: "Validation failed",
      errors: errors, // Include validation errors
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = 200;
    const statusCode = ctx.getResponse().statusCode;

    return response.status(status).json({
      status: false,
      statusCode: statusCode,
      path: request.url,
      message: exception.message,
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  }

  responseHandler(res: any, context: ExecutionContext): Response<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const statusCode = ctx.getResponse().statusCode;

    return {
      status: true,
      statusCode,
      path: request.url,
      message: "Request successful",
      data: res,
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
  }
}
