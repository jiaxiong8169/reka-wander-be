import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // initialize swagger API specs
  const config = new DocumentBuilder()
    .setTitle('Reka Wander API')
    .setDescription('Reka Wander API Specifications')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.set('trust proxy', 1);
  await app.listen(process.env.PORT || 9000);
}
bootstrap();
