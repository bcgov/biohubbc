import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { CreateCollectionI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICollectionParticipant, ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import CollectionForm from '../edit/CollectionForm';

export const defaultCollectionDataFormValues: ICreateCollectionRequest = {
  name: '',
  description: '',
  participants: []
};

/**
 * Page for creating a new collection.
 *
 * @return {*}
 */
const CreateCollectionPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<ICreateCollectionRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const authStateContext = useAuthStateContext();

  const initialParticipants: ICollectionParticipant[] = useMemo(() => {
    if (!authStateContext.simsUserWrapper.systemUserId) {
      return [];
    }
    return [
      {
        system_user_id: authStateContext.simsUserWrapper?.systemUserId,
        display_name: authStateContext.simsUserWrapper?.displayName,
        email: authStateContext.simsUserWrapper?.email,
        agency: authStateContext.simsUserWrapper?.agency,
        identity_source: authStateContext.simsUserWrapper?.identitySource
      } as ICollectionParticipant
    ];
  }, [authStateContext.simsUserWrapper]);

  const initialCollectionData: ICreateCollectionRequest = useMemo(() => {
    return {
      ...defaultCollectionDataFormValues,
      participants: initialParticipants
    };
  }, [initialParticipants]);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateCollectionI18N.createErrorTitle,
      dialogText: CreateCollectionI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    history.push('/admin/summary');
  };

  /**
   * Creates a new collection record
   *
   * @param {ICreateCollectionRequest} collectionPostObject
   * @return {*}
   */
  const createCollection = async (collectionPostObject: ICreateCollectionRequest) => {
    setIsSaving(true);
    try {
      const response = await biohubApi.collection.createCollection(collectionPostObject);

      if (!response?.collections) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a collection ID.'
        });
        return;
      }

      setEnableCancelCheck(false);
      skipUnsavedChangesDialog();
      history.push(`/admin/summary`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Create New Collection"
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-collection-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <CollectionForm
            initialCollectionData={initialCollectionData}
            handleSubmit={(formikData) => createCollection(formikData)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-collection-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateCollectionPage;
