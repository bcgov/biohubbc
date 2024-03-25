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
  UNVERIFIED = 'UNVERIFIED',
  SYSTEM = 'SYSTEM'
}

export enum SCHEMAS {
  API = 'BIOHUB_DAPI_V1',
  DATA = 'BIOHUB'
}

/**
 * The source system for a dataset submission.
 *
 * Typically an external system that is participating in BioHub by submitting data to the BioHub Platform Backbone.
 *
 * Sources are based on the client id of the keycloak service account the participating system uses to authenticate with
 * the BioHub Platform Backbone.
 *
 * @export
 * @enum {number}
 */
export enum SOURCE_SYSTEM {
  'SIMS-SVC-4464' = 'SIMS-SVC-4464'
}
