import { defineConfigFactory, type PartialEggConfig } from 'egg';

export default defineConfigFactory((appInfo) => {
  const config = {
    keys: appInfo.name + '_{{keys}}',

    middleware: ['responseWrapper'] as string[],

    multipart: {
      mode: 'file' as const,
    },

    security: {
      csrf: { enable: false },
    },

    jwt: {
      secret: 'your-jwt-secret-key-change-in-production',
      expiresIn: '7d',
    },
  } as PartialEggConfig;

  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  return {
    ...config,
    bizConfig,
  };
});
