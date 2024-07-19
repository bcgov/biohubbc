import { mdiDotsVertical, mdiFileDocumentPlusOutline, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
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
    } catch (err: any) {
      dialogContext.setErrorDialog({
        dialogTitle: SurveyAnimalsI18N.importRecordsErrorDialogTitle,
        dialogText: SurveyAnimalsI18N.importRecordsErrorDialogText,
        dialogErrorDetails: [err.message],
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
      <FileUploadDialog
        open={openImportDialog}
        dialogTitle="Import Animals CSV"
        onClose={() => setOpenImportDialog(false)}
        onUpload={handleImportAnimals}
        uploadButtonLabel="Import"
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
        }}
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
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/create`}
          startIcon={<Icon path={mdiPlus} size={1} />}
          sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
          Add
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenImportDialog(true)}
          startIcon={<Icon path={mdiFileDocumentPlusOutline} size={1} />}
          sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, '& .MuiButton-startIcon': { mx: 0 } }}></Button>
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
