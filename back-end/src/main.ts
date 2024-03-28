import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {cors: true});
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            enableDebugMessages: true
        }),
    );
    app.enableCors({
        origin: '*',
        methods: 'GET, PUT, POST, PATCH, DELETE',
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('CGIAR M-QAP')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.DEFAULT_PORT);
}

bootstrap();