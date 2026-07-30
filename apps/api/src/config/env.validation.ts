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
});

export type { EnvironmentVariables };
export { envValidationSchema };
