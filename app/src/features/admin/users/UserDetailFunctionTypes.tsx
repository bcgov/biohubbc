import { ISnackbarProps } from '../../../contexts/dialogContext';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IGetProjectParticipantsResponse } from '../../../interfaces/useProjectApi.interface';

export type IShowSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => void;

export type IOpenYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => void;

export type IOpenErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => void;

export type ICheckForProjectLead = (
  projectParticipants: IGetProjectParticipantsResponse,
  projectParticipationId: number
) => boolean;
