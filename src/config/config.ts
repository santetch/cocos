import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: string;
}

const config: Config = {
  port: process.env.PORT ?? '3020'
};

export { Config, config };
