import { Color } from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
import deepPurple from '@mui/material/colors/deepPurple';
import green from '@mui/material/colors/green';

export enum AdministrativeActivityType {
  SYSTEM_ACCESS = 'System Access'
}

export enum AdministrativeActivityStatusType {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

export const SurveyProgressChipColours: Record<string, { colour: Color }> = {
  Planning: { colour: blueGrey },
  'In progress': { colour: deepPurple },
  Completed: { colour: green }
};
