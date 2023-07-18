import axios from 'axios';

const CB_API_URL = process.env.CRITTERBASE_API ?? 'http://127.0.0.1:9090/api';
const CB_API_KEY = process.env.CRITTERBASE_API_KEY ?? 'missing API KEY';
const CB_DEV_USER_ID = process.env.CRITTERBASE_DEV_USER_ID ?? 'missing dev critterbase user uuid';
const CB_DEV_KEYCLOAK_UUID = process.env.CRITTERBASE_DEV_KEYCLOAK_UUID ?? 'missing dev keycloak uuid';

const CB_PROD_HEADERS = {
  'api-key': CB_API_KEY
};

const CB_DEV_HEADERS = {
  'user-id': CB_DEV_USER_ID,
  'keycloak-uuid': CB_DEV_KEYCLOAK_UUID,
  ...CB_PROD_HEADERS
};

export const critterbase = axios.create({
  baseURL: CB_API_URL,
  headers: CB_DEV_HEADERS
});
