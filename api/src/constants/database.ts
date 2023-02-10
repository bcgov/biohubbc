/**
 * Identity sources supported/recognized by the database.
 *
 * @export
 * @enum {number}
 */
export enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID_BASIC = 'BCEIDBASIC',
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  SYSTEM = 'SYSTEM'
}

export enum SCHEMAS {
  API = 'BIOHUB_DAPI_V1',
  DATA = 'BIOHUB'
}
