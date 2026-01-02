import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5001,
  jwt: {
    jwt_secret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
    expires_in: process.env.JWT_EXPIRES_IN || "7d",
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET || "default_refresh_secret_change_in_production",
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "30d",
    reset_pass_secret: process.env.JWT_RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.JWT_RESET_PASS_TOKEN_EXPIRES_IN,
  },
};

