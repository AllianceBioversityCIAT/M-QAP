import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';

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
    await app.listen(process.env.DEFAULT_PORT);
}

bootstrap();