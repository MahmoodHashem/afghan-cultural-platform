import Joi from "joi";

type EnvironmentVariables = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  REFRESH_COOKIE_NAME: string;
  REFRESH_COOKIE_DOMAIN: string;
  MAX_ACTIVE_SESSIONS: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_FROM: string;
  SMTP_FROM_NAME: string;
  EMAIL_VERIFICATION_URL: string;
  EMAIL_VERIFICATION_EXPIRES_IN_HOURS: number;
  PASSWORD_RESET_URL: string;
  PASSWORD_RESET_EXPIRES_IN_MINUTES: number;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  FACEBOOK_CALLBACK_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  YOUTUBE_API_KEY: string;
  MAX_IMAGES_PER_ENTRY: number;
  MAX_IMAGE_SIZE_MB: number;
};

const MIN_JWT_SECRET_LENGTH = 32;

const envValidationSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(4000),
  FRONTEND_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(MIN_JWT_SECRET_LENGTH).required(),
  JWT_REFRESH_SECRET: Joi.string().min(MIN_JWT_SECRET_LENGTH).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().trim().min(1).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().trim().min(1).required(),
  REFRESH_COOKIE_NAME: Joi.string().trim().min(1).default("refresh_token"),
  REFRESH_COOKIE_DOMAIN: Joi.string().trim().allow("").default(""),
  MAX_ACTIVE_SESSIONS: Joi.number().integer().positive().default(10),
  SMTP_HOST: Joi.string().trim().min(1).required(),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_USER: Joi.string().trim().min(1).required(),
  SMTP_PASSWORD: Joi.string().trim().min(1).required(),
  SMTP_FROM: Joi.string().trim().min(1).required(),
  SMTP_FROM_NAME: Joi.string().trim().min(1).required(),
  EMAIL_VERIFICATION_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  EMAIL_VERIFICATION_EXPIRES_IN_HOURS: Joi.number().integer().positive().required(),
  PASSWORD_RESET_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  PASSWORD_RESET_EXPIRES_IN_MINUTES: Joi.number().integer().positive().required(),
  GOOGLE_CLIENT_ID: Joi.string().trim().min(1).required(),
  GOOGLE_CLIENT_SECRET: Joi.string().trim().min(1).required(),
  GOOGLE_CALLBACK_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  FACEBOOK_APP_ID: Joi.string().trim().min(1).required(),
  FACEBOOK_APP_SECRET: Joi.string().trim().min(1).required(),
  FACEBOOK_CALLBACK_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().trim().min(1).required(),
  CLOUDINARY_API_KEY: Joi.string().trim().min(1).required(),
  CLOUDINARY_API_SECRET: Joi.string().trim().min(1).required(),
  YOUTUBE_API_KEY: Joi.string().trim().min(1).required(),
  MAX_IMAGES_PER_ENTRY: Joi.number().integer().positive().default(6),
  MAX_IMAGE_SIZE_MB: Joi.number().integer().positive().default(5),
});

export type { EnvironmentVariables };
export { envValidationSchema };
