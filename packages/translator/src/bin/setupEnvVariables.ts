import { config } from 'dotenv';
import path from 'path';

import { ROOT_PATH } from '../configs';

export const setupEnvVariables = (env: 'development' | 'production') => {
  config({
    path: path.resolve(ROOT_PATH, `.env.${env}`),
  });
};
