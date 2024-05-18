import { Color } from '@mui/material';
import blue from '@mui/material/colors/blue';
import green from '@mui/material/colors/green';
import purple from '@mui/material/colors/purple';

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