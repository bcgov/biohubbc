import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GeneralInformationCollectionForm from 'features/collection/edit/general/GeneralInformationCollectionForm';
import ParticipantsCollectionForm from 'features/collection/edit/participants/ParticipantsCollectionForm';
import { useCodesContext } from 'hooks/useContext';
import { ICollection } from 'interfaces/useCollectionApi.interface';

interface ISubcollectionFormProps {
  collection: ICollection;
}

/**
 * Form for creating tags within a collection and managing access
 *
 * @param {ISubcollectionFormProps} props
 * @returns
 */
export const SubcollectionForm = (props: ISubcollectionFormProps) => {
  const { collection } = props;
  const codesContext = useCodesContext();

  const codes = codesContext.codesDataLoader.data;

  return (
    <>
      <GeneralInformationCollectionForm />
      <Box mt={5}>
        <Typography fontWeight={700}>Members</Typography>
        <Typography color="textSecondary" mt={1} mb={3}>
          All members of <strong>{collection.name}</strong> will inherit access to the subproject
        </Typography>
        <ParticipantsCollectionForm roles={codes?.collection_roles ?? []} />
      </Box>
    </>
  );
};
