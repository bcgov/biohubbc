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
  module: z.object({
    db: z.string(),
    api: z.string(),
    app: z.string()
  }),
  api: z.object({
    pr: z.object({
      build: z.object({
        tz: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        tz: z.string(),
        backboneApiHost: z.string(),
        backboneIntakePath: z.string(),
        backboneArtifactIntakePath: z.string(),
        backboneIntakeEnabled: z.boolean(),
        bctwApiHost: z.string(),
        critterbaseApiHost: z.string(),
        elasticsearchURL: z.string(),
        elasticsearchTaxonomyIndex: z.string(),
        s3KeyPrefix: z.string(),
        logLevel: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    dev: z.object({
      build: z.object({
        tz: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        tz: z.string(),
        backboneApiHost: z.string(),
        backboneIntakePath: z.string(),
        backboneArtifactIntakePath: z.string(),
        backboneIntakeEnabled: z.boolean(),
        bctwApiHost: z.string(),
        critterbaseApiHost: z.string(),
        elasticsearchURL: z.string(),
        elasticsearchTaxonomyIndex: z.string(),
        s3KeyPrefix: z.string(),
        logLevel: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    test: z.object({
      build: z.object({
        tz: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        tz: z.string(),
        backboneApiHost: z.string(),
        backboneIntakePath: z.string(),
        backboneArtifactIntakePath: z.string(),
        backboneIntakeEnabled: z.boolean(),
        bctwApiHost: z.string(),
        critterbaseApiHost: z.string(),
        elasticsearchURL: z.string(),
        elasticsearchTaxonomyIndex: z.string(),
        s3KeyPrefix: z.string(),
        logLevel: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    prod: z.object({
      build: z.object({
        tz: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        staticAppVanityUrl: z.string(),
        tz: z.string(),
        backboneApiHost: z.string(),
        backboneIntakePath: z.string(),
        backboneArtifactIntakePath: z.string(),
        backboneIntakeEnabled: z.boolean(),
        bctwApiHost: z.string(),
        critterbaseApiHost: z.string(),
        elasticsearchURL: z.string(),
        elasticsearchTaxonomyIndex: z.string(),
        s3KeyPrefix: z.string(),
        logLevel: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    })
  }),
  app: z.object({
    pr: z.object({
      build: z.object({
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        siteminderLogoutURL: z.string(),
        maxUploadNumFiles: z.number(),
        maxUploadFileSize: z.number(),
        biohubFeatureFlag: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    dev: z.object({
      build: z.object({
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        siteminderLogoutURL: z.string(),
        maxUploadNumFiles: z.number(),
        maxUploadFileSize: z.number(),
        biohubFeatureFlag: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    test: z.object({
      build: z.object({
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        siteminderLogoutURL: z.string(),
        maxUploadNumFiles: z.number(),
        maxUploadFileSize: z.number(),
        biohubFeatureFlag: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    }),
    prod: z.object({
      build: z.object({
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        staticApiUrl: z.string(),
        staticAppUrl: z.string(),
        staticAppVanityUrl: z.string(),
        siteminderLogoutURL: z.string(),
        maxUploadNumFiles: z.number(),
        maxUploadFileSize: z.number(),
        biohubFeatureFlag: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string(),
        replicasMax: z.string()
      })
    })
  }),
  database: z.object({
    pr: z.object({
      build: z.object({
        tz: z.string(),
        dbSetupDockerfilePath: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        tz: z.string(),
        volumeCapacity: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string()
      })
    }),
    dev: z.object({
      build: z.object({
        tz: z.string(),
        dbSetupDockerfilePath: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        tz: z.string(),
        volumeCapacity: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string()
      })
    }),
    test: z.object({
      build: z.object({
        tz: z.string(),
        dbSetupDockerfilePath: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        tz: z.string(),
        volumeCapacity: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string()
      })
    }),
    prod: z.object({
      build: z.object({
        tz: z.string(),
        dbSetupDockerfilePath: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string()
      }),
      deploy: z.object({
        nodeEnv: z.string(),
        tz: z.string(),
        volumeCapacity: z.string(),
        cpuRequest: z.string(),
        cpuLimit: z.string(),
        memoryRequest: z.string(),
        memoryLimit: z.string(),
        replicas: z.string()
      })
    })
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
