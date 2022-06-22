import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DialogContext } from 'contexts/dialogContext';
import { useContext, useEffect } from 'react';
import { DataLoader } from './useDataLoader';

export default function useDataLoaderError<T = unknown, R = unknown>(
  dataLoader: DataLoader<T, R>,
  errorDialogProps: Partial<IErrorDialogProps>
) {
  const dialogContext = useContext(DialogContext);

  useEffect(() => {
    if (!dataLoader.error || dialogContext.errorDialogProps.open) {
      return;
    }

    dialogContext.setErrorDialog(errorDialogProps);
  }, [dataLoader.error, errorDialogProps, dialogContext]);
}
