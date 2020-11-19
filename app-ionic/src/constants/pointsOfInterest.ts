import { SvgIconComponent, Description } from '@material-ui/icons';

export enum PointOfInterestType {
  IAPP_Site = 'Point Of Interest'
}

export enum PointOfInterestSubtype {
  PointOfInterest_IAPP_Site = 'PointOfInterest_IAPP_SITE'
}

export const PointOfInterestTypeIcon: { [key: string]: SvgIconComponent } = {
  [PointOfInterestType.IAPP_Site]: Description
};

export enum PointOfInterestStatus {
  NEW = 'New',
  EDITED = 'Edited'
}

export enum PointOfInterestSyncStatus {
  NOT_SYNCED = 'Not Synced',
  SYNC_SUCCESSFUL = 'Sync Successful',
  SYNC_FAILED = 'Sync Failed'
}
