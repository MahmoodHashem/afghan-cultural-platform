import "./register-path-aliases";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.getOrThrow<string>("FRONTEND_URL");
  const corsAllowedOrigins = configService
    .get<string>("CORS_ALLOWED_ORIGINS", "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedFrontendOrigins = new Set([frontendUrl, ...corsAllowedOrigins]);
  const port = configService.get<number>("PORT", 4000);

  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();
  app.use(helmet());
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, !origin || allowedFrontendOrigins.has(origin));
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  if (configService.get<string>("NODE_ENV", "development") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Afghan Cultural Information Platform API")
      .setDescription("REST API for the Afghan cultural information crowdsourcing platform")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  await app.listen(port);
}
bootstrap();
