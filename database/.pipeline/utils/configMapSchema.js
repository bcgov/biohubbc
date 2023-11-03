const z = require('zod');

const PipelineConfigMapSchema = z.object({
  name: z.string(),
  namespaceSuffix: z.string(),
  namespace: z.object({
    tools: z.string(),
    dev: z.string(),
    test: z.string(),
    prod: z.string()
  }),
  version: z.string(),
  timezone: z.object({
    db: z.string()
  }),
  module: z.object({
    db: z.string(),
    api: z.string(),
    app: z.string()
  }),
  staticUrls: z.object({
    dev: z.string(),
    test: z.string(),
    prod: z.string(),
    prodVanityUrl: z.string()
  }),
  staticUrlsAPI: z.object({
    dev: z.string(),
    test: z.string(),
    prod: z.string()
  }),
  siteminderLogoutURL: z.object({
    dev: z.string(),
    test: z.string(),
    prod: z.string()
  }),
  sso: z.object({
    dev: z.object({
      host: z.string(),
      realm: z.string(),
      clientId: z.string(),
      keycloakSecret: z.string(),
      serviceClient: z.object({
        serviceClientName: z.string(),
        keycloakSecretServiceClientPasswordKey: z.string()
      }),
      cssApi: z.object({
        cssApiTokenUrl: z.string(),
        cssApiClientId: z.string(),
        cssApiHost: z.string(),
        keycloakSecretCssApiSecretKey: z.string(),
        cssApiEnvironment: z.string()
      })
    }),
    test: z.object({
      host: z.string(),
      realm: z.string(),
      clientId: z.string(),
      keycloakSecret: z.string(),
      serviceClient: z.object({
        serviceClientName: z.string(),
        keycloakSecretServiceClientPasswordKey: z.string()
      }),
      cssApi: z.object({
        cssApiTokenUrl: z.string(),
        cssApiClientId: z.string(),
        cssApiHost: z.string(),
        keycloakSecretCssApiSecretKey: z.string(),
        cssApiEnvironment: z.string()
      })
    }),
    prod: z.object({
      host: z.string(),
      realm: z.string(),
      clientId: z.string(),
      keycloakSecret: z.string(),
      serviceClient: z.object({
        serviceClientName: z.string(),
        keycloakSecretServiceClientPasswordKey: z.string()
      }),
      cssApi: z.object({
        cssApiTokenUrl: z.string(),
        cssApiClientId: z.string(),
        cssApiHost: z.string(),
        keycloakSecretCssApiSecretKey: z.string(),
        cssApiEnvironment: z.string()
      })
    })
  })
});

module.exports = exports = { PipelineConfigMapSchema };
