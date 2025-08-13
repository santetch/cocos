import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { INestApplication, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { config } from './config/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import metadata from './metadata';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await configSwagger(app);

  app.useGlobalFilters(new HttpExceptionFilter());

  logInfo();

  await app.listen(process.env.PORT ?? 3000);
}

const configSwagger = async (app: INestApplication): Promise<void> => {
  const configSw = new DocumentBuilder()
    .setTitle('API Cocos Backend')
    .setDescription('Provides endpoints for the Cocos Backend')
    .setVersion('1.0')
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);

  const document = SwaggerModule.createDocument(app, configSw);

  SwaggerModule.setup('api', app, document);
};

const logInfo = (): void => {
  const logger = new Logger('Main');

  logger.log(`==> Listening on port ${config.port}`);

  logger.log(`==> Swagger DOC http://localhost:${config.port}/api`);
};

bootstrap();
