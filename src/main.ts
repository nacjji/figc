import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';

const port = process.env.PORT || 3200;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(passport.initialize()); // passport 초기화

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FIGC')
    .setDescription('FIGC API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );

  // 인터셉터 적용
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  // global 예외 필터 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: '*',
    exposedHeaders: ['Authorization'],

    // exposedHeaders: ['Authorization'],
    // credentials: true,
  });

  await app.listen(port, () => {
    console.log(
      `FIGC Server listening on port : ${port} , STAGE : ${process.env.STAGE}`,
    );
  });
}
bootstrap();
