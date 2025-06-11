import { mdiPlaylistPlus, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { downloadFile } from 'utils/file-utils';
import { getAnimalCSVTemplate } from '../../../../../utils/csv-templates';

interface IAnimaListToolbarProps {
  animalCount: number;
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
    await biohubApi.survey.importCrittersFromCsv(file, surveyContext.surveyId, cancelToken, onProgress);

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
          flex: '1 1 auto',
          pl: 1,
          minHeight: '0 !important'
        }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Animals &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({props.animalCount})
          </Typography>
        </Typography>
        <Tooltip title="Bulk import animals">
          <IconButton color="primary" sx={{ mr: 1 }} onClick={() => setOpenImportDialog(true)} aria-label="Import CSV">
            <Icon path={mdiPlaylistPlus} size={1} />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          component={RouterLink}
          color="primary"
          startIcon={<Icon path={mdiPlus} size={1} />}
          to={`/admin/surveys/${surveyContext.surveyId}/animals/create`}>
          Add
        </Button>
      </Toolbar>
    </>
  );
};
