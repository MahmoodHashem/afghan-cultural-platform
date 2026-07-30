import Joi from "joi";

type EnvironmentVariables = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
};

const envValidationSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(4000),
  FRONTEND_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .required(),
});

export type { EnvironmentVariables };
export { envValidationSchema };
