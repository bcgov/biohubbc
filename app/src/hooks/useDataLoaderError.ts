import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DialogContext } from 'contexts/dialogContext';
import { useContext, useEffect } from 'react';
import { APIError } from './api/useAxios';
import { DataLoader } from './useDataLoader';

/**
 * Hook that renders an error dialog if the `dataLoader` throws an error.
 *
 * @export
 * @template AFArgs `AsyncFunction` argument types.
 * @template AFResponse `AsyncFunction` response type.
 * @template AFError `AsyncFunction` error type.
 * @param {DataLoader<AFArgs, AFResponse, AFError>} dataLoader A `DataLoader`.
 * @param {(dataLoader: DataLoader<AFArgs, AFResponse, AFError>) => Partial<IErrorDialogProps>} getErrorDialogProps A
 * function that receives the dataLoader and returns an `IErrorDialogProps` object, which will be passed to the
 * rendered error dialog.
 */
export default function useDataLoaderError<AFArgs extends any[], AFResponse = unknown, AFError = unknown>(
  dataLoader: DataLoader<AFArgs, AFResponse, AFError>,
  getErrorDialogProps: (dataLoader: DataLoader<AFArgs, AFResponse, AFError>) => Partial<IErrorDialogProps>
) {
  const dialogContext = useContext(DialogContext);

  useEffect(() => {
    if (!dataLoader.error || dialogContext.errorDialogProps.open) {
      return;
    }

    dialogContext.setErrorDialog({
      open: true,
      dialogTitle: 'Error Loading Data',
      dialogText:
        'An unexpected error has occurred while attempting to load data, please try again. If the error persists, please contact your system administrator.',
      dialogError: (dataLoader.error as APIError).message,
      dialogErrorDetails: (dataLoader.error as APIError).errors,
      onOk: () => {
        dataLoader.clear();
        dialogContext.setErrorDialog({ open: false });
      },
      onClose: () => {
        dataLoader.clear();
        dialogContext.setErrorDialog({ open: false });
      },
      ...getErrorDialogProps(dataLoader)
    });
  }, [dataLoader.error, dialogContext, dataLoader, getErrorDialogProps]);
}
