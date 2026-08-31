import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "../../common/mail/mail.module";
import { PrismaModule } from "../../database/prisma.module";
import { UsersModule } from "../users/users.module";
import { JWT_ACCESS_STRATEGY } from "./auth.constants";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: JWT_ACCESS_STRATEGY }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn =
          configService.getOrThrow<NonNullable<JwtSignOptions["expiresIn"]>>(
            "JWT_ACCESS_EXPIRES_IN",
          );

        return {
          secret: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, GoogleStrategy, FacebookStrategy],
  exports: [AuthService],
})
class AuthModule {}

export { AuthModule };
