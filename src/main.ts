import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './interceptor/response.interceptor';

import  'reflect-metadata'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const formatErrors = (errors: any) => {
          return errors.map((error: any) => {
            const constraints = Object.values(error.constraints || {});
            const nestedErrors =
              error.children && error.children.length > 0
                ? formatErrors(error.children)
                : [];

            return {
              field: error.property,
              errors: constraints.concat(...nestedErrors),
            };
          });
        };

        const errors = formatErrors(validationErrors);

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: errors,
        });
      },
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global prefix for all routes
  app.setGlobalPrefix('/api');
  app.enableCors();

  await app.listen(3000);
}
bootstrap();