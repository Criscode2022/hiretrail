import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const origin = process.env.CORS_ORIGIN ?? true;
  app.enableCors({
    origin,
    credentials: true,
  });

  const webDistCandidates = [
    join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
    join(__dirname, '..', '..', 'web', 'dist', 'web'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web'),
    join(process.cwd(), 'dist', 'web', 'browser'),
  ];
  const webDist = webDistCandidates.find((p) =>
    existsSync(join(p, 'index.html')),
  );
  if (webDist) {
    app.useStaticAssets(webDist);
    // SPA fallback — Express 5 / path-to-regexp v8 compatible
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(
      (
        req: { method: string; path: string },
        res: {
          sendFile: (p: string, cb?: (err?: Error) => void) => void;
          status: (n: number) => { end: () => void };
        },
        next: () => void,
      ) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api')) return next();
        if (req.path.includes('.')) return next();
        res.sendFile(join(webDist, 'index.html'), (err) => {
          if (err) next();
        });
      },
    );
  }

  const port = Number(process.env.PORT ?? 8080);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  console.log(`HireTrail API listening on http://${host}:${port}`);
  if (webDist) console.log(`Serving Angular SPA from ${webDist}`);
}

bootstrap();
