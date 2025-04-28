import { mdiDotsVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import { DualImportButton } from 'components/buttons/DualImportButton';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { downloadFile } from 'utils/file-utils';
import { getAnimalCSVTemplate } from '../../../../../utils/csv-templates';

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

  const [openImportDialog, setOpenImportDialog] = useState(false);

  const cancelToken = axios.CancelToken.source();

  const handleImportAnimals = async (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => {
    await biohubApi.survey.importCrittersFromCsv(
      file,
      surveyContext.projectId,
      surveyContext.surveyId,
      cancelToken,
      onProgress
    );

    surveyContext.critterDataLoader.refresh(surveyContext.surveyId);

    setOpenImportDialog(false);
  };

  return (
    <>
      <CSVSingleImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        dialogTitle="Import Animal CSV"
        dialogSummary="Import a CSV file containing animal records"
        onImport={handleImportAnimals}
        onDownloadTemplate={() => downloadFile(getAnimalCSVTemplate(), 'SIMS-critter-template.csv')}
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
