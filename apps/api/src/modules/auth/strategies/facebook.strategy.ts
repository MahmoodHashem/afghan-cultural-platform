import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { type Profile, Strategy } from "passport-facebook";

import { AuthProvider } from "@/generated/prisma/enums";
import { FACEBOOK_AUTH_STRATEGY } from "@/modules/auth/auth.constants";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

type FacebookProfile = Profile & {
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
};

@Injectable()
class FacebookStrategy extends PassportStrategy(Strategy, FACEBOOK_AUTH_STRATEGY) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("FACEBOOK_APP_ID"),
      clientSecret: configService.getOrThrow<string>("FACEBOOK_APP_SECRET"),
      callbackURL: configService.getOrThrow<string>("FACEBOOK_CALLBACK_URL"),
      scope: ["email", "public_profile"],
      profileFields: ["id", "displayName", "emails", "photos"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: FacebookProfile,
  ): NormalizedOAuthProfile {
    const email = profile.emails?.[0]?.value ?? null;

    return {
      provider: AuthProvider.FACEBOOK,
      providerAccountId: profile.id,
      email,
      emailVerified: false,
      displayName: profile.displayName || email || "Facebook User",
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}

export { FacebookStrategy };
