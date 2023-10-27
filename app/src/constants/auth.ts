export enum SYSTEM_IDENTITY_SOURCE {
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  BCEID_BASIC = 'BCEIDBASIC',
  IDIR = 'IDIR',
  DATABASE = 'DATABASE',
  UNVERIFIED = 'UNVERIFIED'
}

export interface IUserInfo {
  sub: string;
  email_verified: boolean;
  preferred_username: string;
  identity_source: string;
  display_name: string;
  email: string;
}

export interface IIDIRUserInfo extends IUserInfo {
  idir_user_guid: string;
  idir_username: string;
  name: string;
  given_name: string;
  family_name: string;
}

interface IBCEIDBasicUserInfo extends IUserInfo {
  bceid_user_guid: string;
  bceid_username: string;
}

export interface IBCEIDBusinessUserInfo extends IBCEIDBasicUserInfo {
  bceid_business_guid: string;
  bceid_business_name: string;
}
