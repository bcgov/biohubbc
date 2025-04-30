import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { EditCollectionI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICollectionParticipant, IUpdateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import CollectionForm from '../edit/CollectionForm';

export const defaultCollectionDataFormValues: IUpdateCollectionRequest = {
  collection_id: null as unknown as number,
  parent_collection_id: null,
  name: '',
  description: '',
  participants: []
};

/**
 * Page for creating a new collection.
 *
 * @return {*}
 */
const EditCollectionPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<IUpdateCollectionRequest>>(null);

  const { id: collectionId } = useParams<{ id: string }>();

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  const collectionDataLoader = useDataLoader((collectionId: number) =>
    biohubApi.collection.getCollection(collectionId)
  );

  useEffect(() => {
    if (collectionId) {
      collectionDataLoader.load(Number(collectionId));
    }
  }, [collectionDataLoader, collectionId]);

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

  const initialCollectionData: IUpdateCollectionRequest = useMemo(() => {
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

  const showEditErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditCollectionI18N.createErrorTitle,
      dialogText: EditCollectionI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    history.goBack();
  };

  /**
   * Updates a collection
   *
   * @param {IEditCollectionRequest} collectionPostObject
   * @return {*}
   */
  const updateCollection = async (collectionPostObject: IUpdateCollectionRequest) => {
    setIsSaving(true);

    const { collection_id, ...values } = collectionPostObject;
    try {
      await biohubApi.collection.updateCollection(Number(collection_id), {
        ...values,
        participants: values.participants.map((participant) => ({
          system_user_id: participant.system_user_id,
          collection_role_name: participant.collection_role_name
        }))
      });

      setEnableCancelCheck(false);
      skipUnsavedChangesDialog();
      history.goBack();
    } catch (error) {
      showEditErrorDialog({ dialogError: (error as APIError).message });
    }
    setIsSaving(false);
  };

  if (!codesContext.codesDataLoader.data || !collectionId) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit New Collection"
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
            initialCollectionData={collectionDataLoader.data ?? initialCollectionData}
            handleSubmit={(formikData) => updateCollection(formikData)}
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

export default EditCollectionPage;
