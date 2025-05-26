import { mdiFileDocumentPlusOutline, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { getMortalityCSVTemplate } from 'utils/csv-templates';
import { downloadFile } from 'utils/file-utils';

interface IAnimalMortalityToolbarProps {
  mortalityCount: number;
  onAddAnimalMortality: () => void;
}

/**
 * Toolbar for actions affecting an animal's Mortality, ie. add a new Mortality
 *
 * @param {IAnimalMortalityToolbarProps} props
 * @return {*}
 */
export const AnimalMortalityToolbar = (props: IAnimalMortalityToolbarProps) => {
  const { onAddAnimalMortality, mortalityCount } = props;
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const [openImportDialog, setOpenImportDialog] = useState(false);

  const cancelToken = axios.CancelToken.source();

  const handleImportMortalities = async (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => {
    await biohubApi.survey.importCrittersFromCsv(
      file,
      surveyContext.projectId,
      surveyContext.surveyId,
      cancelToken,
      onProgress
    );

    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

    setOpenImportDialog(false);
  };

  return (
    <>
          <CSVSingleImportDialog
            open={openImportDialog}
            onClose={() => setOpenImportDialog(false)}
            dialogTitle="Import Animal Mortality CSV"
            dialogSummary="Import a CSV file containing animal mortality records."
            onImport={handleImportMortalities}
            onDownloadTemplate={() => downloadFile(getMortalityCSVTemplate(), 'SIMS-mortality-template.csv')}
          />
    
    
    <Toolbar
      disableGutters
      sx={{
        px: 2
      }}>
      <Typography
        data-testid="map-control-title"
        component="div"
        fontWeight="700"
        sx={{
          flex: '1 1 auto'
        }}>
        Mortality
        <Typography component="span" color="textSecondary" sx={{ ml: 0.5, flex: '1 1 auto' }}>
          ({mortalityCount})
        </Typography>
      </Typography>
      {mortalityCount === 0 && (
        <Box display="flex">
          <Button
            variant="contained"
            color="primary"
            onClick={onAddAnimalMortality}
            startIcon={<Icon path={mdiPlus} size={1} />}
            sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
            Report Mortality
          </Button>
          <Button
          variant="contained"
          color="primary"
          startIcon={<Icon path={mdiFileDocumentPlusOutline} size={1} />}
          sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, '& .MuiButton-startIcon': { mx: 0 } }}
          onClick={() => setOpenImportDialog(true)}
        />
      </Box>
      )}
    </Toolbar>
  </>
  );
};
