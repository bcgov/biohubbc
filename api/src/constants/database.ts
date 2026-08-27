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

export type BioHubIdentitySource =
  | SYSTEM_IDENTITY_SOURCE.IDIR
  | SYSTEM_IDENTITY_SOURCE.BCEID_BASIC
  | SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;

export const BIOHUB_IDENTITY_SOURCES: ReadonlySet<string> = new Set([
  SYSTEM_IDENTITY_SOURCE.IDIR,
  SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
  SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS
]);

/**
 * The source system for a survey submission.
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
