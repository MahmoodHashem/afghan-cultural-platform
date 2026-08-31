import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { type Profile, Strategy } from "passport-google-oauth20";

import { AuthProvider } from "../../../generated/prisma/enums";
import { GOOGLE_AUTH_STRATEGY } from "../auth.constants";
import type { NormalizedOAuthProfile } from "../types/oauth-profile.type";

@Injectable()
class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE_AUTH_STRATEGY) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["profile", "email"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): NormalizedOAuthProfile {
    const primaryEmail = profile.emails?.[0];
    const email = primaryEmail?.value ?? profile._json.email ?? null;
    const emailVerified = primaryEmail?.verified ?? profile._json.email_verified ?? false;

    return {
      provider: AuthProvider.GOOGLE,
      providerAccountId: profile.id,
      email,
      emailVerified,
      displayName: profile.displayName || profile._json.name || email || "Google User",
      avatarUrl: profile.photos?.[0]?.value ?? profile._json.picture ?? null,
    };
  }
}

export { GoogleStrategy };
