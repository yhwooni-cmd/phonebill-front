/// <reference types="vite/client" />

interface RuntimeConfig {
  API_GROUP: string;
  USER_HOST: string;
  BILL_HOST: string;
  PRODUCT_HOST: string;
  KOS_MOCK_HOST: string;
}

declare global {
  interface Window {
    __runtime_config__?: RuntimeConfig;
  }
}

export {};