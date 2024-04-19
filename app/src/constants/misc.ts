import { Color } from '@mui/material';
import { blue, green, purple } from '@mui/material/colors';

export enum AdministrativeActivityType {
  SYSTEM_ACCESS = 'System Access'
}

export enum AdministrativeActivityStatusType {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

export const SurveyProgressChipColours: Record<string, Color> = {
  PLANNING: blue,
  'IN PROGRESS': purple,
  COMPLETED: green
};
