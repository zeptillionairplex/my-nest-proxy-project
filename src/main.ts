import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import localtunnel from 'localtunnel';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // LocalTunnel 설정 및 URL 출력
  const tunnel = await localtunnel({ port: 3000 });

  Logger.log(`LocalTunnel is running at: ${tunnel.url}`, 'Bootstrap');

  tunnel.on('close', () => {
    Logger.log('LocalTunnel is closed', 'Bootstrap');
  });
}

bootstrap();
