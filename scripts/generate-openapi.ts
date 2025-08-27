import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from '../src/app.module';
import {writeFileSync} from 'fs';

async function generate() {
    const app = await NestFactory.create(AppModule, {logger: false});

    const config = new DocumentBuilder()
        .setTitle('Validador de Questões API')
        .setDescription('API para validação e gerenciamento de questões educacionais')
        .setVersion('1.0')
        .setContact(
            'Suporte',
            'https://validador.com/contato',
            'suporte@validador.com'
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addTag('auth', 'Endpoints de autenticação')
        .addTag('questions', 'Endpoints de questões')
        .addTag('users', 'Endpoints de usuários')
        .addTag('disciplines', 'Endpoints de disciplinas')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Token JWT para autenticação',
                in: 'header',
            },
            'JWT-auth'
        )
        .addServer('http://localhost:3000', 'Desenvolvimento')
        .addServer('https://api.validador.com', 'Produção')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    writeFileSync('openapi.json', JSON.stringify(document, null, 2));
    await app.close();
    // não chama app.listen(); não precisa subir servidor
}

generate();
