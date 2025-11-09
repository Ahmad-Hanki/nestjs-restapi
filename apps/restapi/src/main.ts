import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from 'shared/all-exceptions.filter';
import { ResponseInterceptor } from 'shared/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
