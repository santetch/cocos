import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { config } from './config/config';


async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // we could config swagger here 

  app.useGlobalFilters(new HttpExceptionFilter());

  logInfo();

  await app.listen(process.env.PORT ?? 3000);
}

function logInfo(): void {
  const logger = new Logger('Main');

  logger.log(`==> Listening on port ${config.port}`);
}

bootstrap();
