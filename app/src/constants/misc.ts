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

export const SurveyProgressChipColours = [
  { label: 'Planning', colour: blueGrey },
  { label: 'In progress', colour: deepPurple },
  { label: 'Completed', colour: green }
];
