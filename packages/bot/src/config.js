import { config } from 'dotenv';

const DEFAULT_CONFIG = {
  PORT: 3978
};

config();

export default function () {
  process.env = {
    ...DEFAULT_CONFIG,
    ...process.env
  };
}
