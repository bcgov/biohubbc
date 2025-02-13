import { mdiDotsVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { DualImportButton } from 'components/buttons/DualImportButton';
import { FileUploadSingleItemDialog } from 'components/dialog/attachments/FileUploadSingleItemDialog';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface IAnimaListToolbarProps {
  animalCount: number;
  checkboxSelectedIdsLength: number;
  handleHeaderMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Toolbar for actions affecting animals with a survey, ie. delete an animal from a Survey
 *
 * @param {IAnimaListToolbarProps} props
 * @return {*}
 */
export const AnimalListToolbar = (props: IAnimaListToolbarProps) => {
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const [openImportDialog, setOpenImportDialog] = useState(false);

  const handleImportAnimals = async (file: File) => {
    try {
      await biohubApi.survey.importCrittersFromCsv(file, surveyContext.projectId, surveyContext.surveyId);
      surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        dialogTitle: SurveyAnimalsI18N.importRecordsErrorDialogTitle,
        dialogText: SurveyAnimalsI18N.importRecordsErrorDialogText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        open: true,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    } finally {
      setOpenImportDialog(false);
    }
  };

  return (
    <>
      <FileUploadSingleItemDialog
        open={openImportDialog}
        dialogTitle="Import Animal CSV"
        onClose={() => setOpenImportDialog(false)}
        onUpload={handleImportAnimals}
        uploadButtonLabel="Import"
        dropZoneProps={{ acceptedFileExtensions: '.csv' }}
      />
      <Toolbar
        disableGutters
        sx={{
          flex: '0 0 auto',
          pr: 3,
          pl: 2
        }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Animals &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({props.animalCount})
          </Typography>
        </Typography>
        <DualImportButton
          singleImportButtonProps={{
            component: RouterLink,
            to: `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/create`
          }}
          bulkImportButtonProps={{
            onClick: () => setOpenImportDialog(true)
          }}
        />
        <IconButton
          edge="end"
          sx={{ ml: 1 }}
          aria-label="header-settings"
          disabled={!props.checkboxSelectedIdsLength}
          onClick={props.handleHeaderMenuClick}
          title="Bulk Actions">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Toolbar>
    </>
  );
};
