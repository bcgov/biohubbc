//
// Index initializers and boot-strapper of NodeJs application which only serve static app
//
// Copyright © 2019 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
/**
 * Imports
 */
const express = require('express');
const path = require('path');
const request = require('request');

/**
 * An immediately invoked function that runs a simple express server to serve the app static build files.
 *
 * This includes a health check endpoint that OpenShift uses to determine if the app is healthy.
 *
 * This file is only used when serving the app in OpenShift.
 * When running the app locally, the app is served by docker-compose, and doesn't use this file at all.
 *
 * Note: All changes to env vars here must also be reflected in the `app/src/contexts/configContext.tsx` file, so that
 * the app has access to the same env vars when running in both OpenShift and local development.
 */
(() => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  // Express APP
  const app = express();
  // Getting Port
  const port = process.env.REACT_APP_PORT;
  // Resource path
  const resourcePath = path.resolve(__dirname, '../build');
  // Setting express static
  app.use(express.static(resourcePath));

  /**
   * Parses a valid feature flag string into an array of feature flag strings.
   *
   * @param {string} featureFlagsString
   * @return {*}  {string[]}
   */
  const parseFeatureFlagsString = (featureFlagsString) => {
    if (!featureFlagsString) {
      return [];
    }

    return featureFlagsString.split(',');
  };

  // App config
  app.use('/config', (_, resp) => {
    const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL;
    const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME;

    const config = {
      API_HOST: process.env.REACT_APP_API_HOST,
      CHANGE_VERSION: process.env.CHANGE_VERSION,
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV,
      VERSION: `${process.env.VERSION}(build #${process.env.CHANGE_VERSION})`,
      KEYCLOAK_CONFIG: {
        authority: process.env.REACT_APP_KEYCLOAK_HOST,
        realm: process.env.REACT_APP_KEYCLOAK_REALM,
        clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID
      },
      SITEMINDER_LOGOUT_URL: process.env.REACT_APP_SITEMINDER_LOGOUT_URL,
      /**
       * File upload settings
       */
      MAX_UPLOAD_NUM_FILES: Number(process.env.REACT_APP_MAX_UPLOAD_NUM_FILES),
      MAX_UPLOAD_FILE_SIZE: Number(process.env.REACT_APP_MAX_UPLOAD_FILE_SIZE),
      S3_PUBLIC_HOST_URL: `https://${OBJECT_STORE_URL}/${OBJECT_STORE_BUCKET_NAME}`,
      /**
       * BioHub settings
       */
      BACKBONE_PUBLIC_API_HOST: process.env.REACT_APP_BACKBONE_PUBLIC_API_HOST,
      BIOHUB_TAXON_PATH: process.env.REACT_APP_BIOHUB_TAXON_PATH,
      BIOHUB_TAXON_TSN_PATH: process.env.REACT_APP_BIOHUB_TAXON_TSN_PATH,
      /**
       * Feature flags
       *
       * Note: Recommend conforming to a consistent pattern when defining feature flags, to make feature flags easy to
       * identify (ie: `[APP/API]_FF_<string>`)
       */
      FEATURE_FLAGS: parseFeatureFlagsString(process.env.REACT_APP_FEATURE_FLAGS)
    };

    resp.status(200).json(config);
  });

  // Health check
  app.use('/healthcheck', (_, resp) => {
    // Request server api
    const host = process.env.REACT_APP_API_HOST;
    request(`https://${host}/`, (err, res) => {
      if (err) {
        console.log(`Error: ${err}, host: ${host}`);
        resp.status(404).json({ error: `${err}`, host: host });
      } else {
        if (res.statusCode === 200) {
          resp.status(200).json({ success: true });
        } else {
          resp.status(404).json({ error: 'API not responding' });
        }
      }
    });
  });

  // All routes
  const route = express.Router();
  route.all('*', express.static(resourcePath));
  app.use('*', route);

  // Logging
  console.log(`Starting express web server on port with resource path => ${port}: ${resourcePath}`);
  // Listing to port
  app.listen(port, () => {
    console.log(`Application started on port => ${port}`);
  });
})();
