import Button, { ButtonProps } from '@mui/material/Button';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import { getObservationCSVTemplate } from 'utils/csv-templates';
import { downloadFile } from 'utils/file-utils';

export interface IImportObservationsButtonProps {
  /**
   * If true, the button will be disabled.
   *
   * @type {boolean}
   * @memberof IImportObservationsButtonProps
   */
  disabled?: boolean;
  /**
   * Callback fired when the import process is started.
   *
   * @memberof IImportObservationsButtonProps
   */
  onStart?: () => void;
  /**
   * Callback fired when the import process is successful.
   *
   * @memberof IImportObservationsButtonProps
   */
  onSuccess?: () => void;
  /**
   * Callback fired when the import process encounters an error.
   *
   * @memberof IImportObservationsButtonProps
   */
  onError?: () => void;
  /**
   * Callback fired when the import process is complete (success or error).
   *
   * @memberof IImportObservationsButtonProps
   */
  onFinish?: () => void;
  /**
   * An optional survey sample period id. All imported observation records will be associated to this sample period.
   *
   * @type {number}
   */
  surveySamplePeriodId?: number;
  /**
   * Optional button props to pass to the button component.
   *
   * @type {ButtonProps}
   */
  buttonProps?: ButtonProps;
}

/**
 * Renders a button that allows the user to import observation records from a CSV file.
 *
 * @param {IImportObservationsButtonProps} props
 * @return {*}
 */
export const ImportObservationsButton = (props: IImportObservationsButtonProps) => {
  const { disabled, surveySamplePeriodId, onStart, onSuccess, onError, onFinish } = props;

  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const { surveyId } = surveyContext;

  const [open, setOpen] = useState<boolean>(false);

  const cancelTokenSource = axios.CancelToken.source();

  /**
   * Callback fired when the user attempts to import observations.
   *
   * @param {File} file
   * @return {*}
   */
  const handleImportObservations = async (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => {
    try {
      onStart?.();

      await biohubApi.observation.importObservationCSV({
        surveyId,
        surveySamplePeriodId,
        file,
        onProgress,
        cancelTokenSource
      });

      onSuccess?.();
    } catch (error) {
      onError?.();
      // re-throw the error so the dialog can display the CSVErrors
      throw error;
    } finally {
      onFinish?.();
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        size="medium"
        onClick={() => setOpen(true)}
        disabled={disabled || false}
        {...props.buttonProps}>
        Import
      </Button>
      <CSVSingleImportDialog
        open={open}
        dialogTitle="Import Observation CSV"
        dialogSummary="Upload a CSV file to import observations"
        onClose={() => setOpen(false)}
        onImport={handleImportObservations}
        onDownloadTemplate={() => downloadFile(getObservationCSVTemplate(), 'SIMS-observations-template.csv')}
      />
    </>
  );
};
