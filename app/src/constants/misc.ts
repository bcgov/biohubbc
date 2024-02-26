export enum AdministrativeActivityType {
  SYSTEM_ACCESS = 'System Access'
}

export enum AdministrativeActivityStatusType {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

export enum BioHubSubmittedStatusType {
  UNSUBMITTED = 'Unsubmitted',
  SUBMITTED = 'Submitted',
  REJECTED = 'Rejected'
}

export enum ProjectStatusType {
  COMPLETED = 'Completed',
  ACTIVE = 'Active'
}

export enum SurveyStatusType {
  COMPLETED = 'Completed',
  ACTIVE = 'Active'
}

export enum DocumentReviewStatus {
  PENDING = 'Pending Review'
}

export const PG_MAX_INT = 2147483647;
