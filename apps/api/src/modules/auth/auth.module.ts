import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { JWT_ACCESS_STRATEGY } from "@/modules/auth/auth.constants";
import { AuthService } from "@/modules/auth/auth.service";
import { JwtAccessStrategy } from "@/modules/auth/strategies/jwt-access.strategy";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [
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
  providers: [AuthService, JwtAccessStrategy],
  exports: [AuthService],
})
class AuthModule {}

export { AuthModule };
