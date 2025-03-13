import { Button } from '@mui/material';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useHabitatFeatureTableContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { getHabitatFeaturesCSVTemplate } from 'utils/csv-templates';
import { downloadFile } from 'utils/file-utils';

interface ImportHabitatFeaturesButtonProps {
  /**
   * The optional survey sample period id. All imported habitat feature records will be associated to this sample period.
   *
   * @type {number}
   */
  samplePeriodId?: number;
  /**
   * Optional button props to pass to the button component.
   *
   * @type {React.ComponentProps<typeof Button>}
   */
  buttonProps?: React.ComponentProps<typeof Button>;
}

/**
 * Button to import habitat features from a CSV file.
 *
 * @param {ImportHabitatFeaturesButtonProps} props
 * @return {*} {JSX.Element}
 */
export const ImportHabitatFeaturesButton = (props: ImportHabitatFeaturesButtonProps): JSX.Element => {
  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

  const [openImportDialog, setOpenImportDialog] = useState(false);

  /**
   * Handle the bulk import of habitat features.
   *
   * @param {File} file
   * @param {(progressEvent: AxiosProgressEvent) => void} onProgress
   * @return {*} {Promise<void>}
   */
  const handleBulkImportHabitatFeatures = async (
    file: File,
    onProgress: (progressEvent: AxiosProgressEvent) => void
  ) => {
    await biohubApi.habitatFeature.importHabitatFeaturesFromCsv(
      file,
      surveyContext.projectId,
      surveyContext.surveyId,
      props.samplePeriodId,
      axios.CancelToken.source(),
      onProgress
    );

    habitatFeatureTableContext.refreshData();

    setOpenImportDialog(false);
  };

  return (
    <>
      <CSVSingleImportDialog
        open={openImportDialog}
        dialogTitle={'Import Habitat Features'}
        dialogSummary={'Import habitat features data for a survey by uploading a CSV file matching the template'}
        onClose={() => setOpenImportDialog(false)}
        onImport={handleBulkImportHabitatFeatures}
        onDownloadTemplate={() => downloadFile(getHabitatFeaturesCSVTemplate(), 'habitat-features-template.csv')}
      />
      <Button onClick={() => setOpenImportDialog(true)} variant="outlined" {...props.buttonProps}>
        Import
      </Button>
    </>
  );
};
