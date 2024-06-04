import { Color } from '@mui/material';
import blue from '@mui/material/colors/blue';
import blueGrey from '@mui/material/colors/blueGrey';
import green from '@mui/material/colors/green';
import indigo from '@mui/material/colors/indigo';
import pink from '@mui/material/colors/pink';
import purple from '@mui/material/colors/purple';
import red from '@mui/material/colors/red';

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

export const TechniqueChipColours = [blue, pink, purple, red, indigo, blueGrey];
