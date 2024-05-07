import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import { Stack } from '@mui/system';
import EditDialog from 'components/dialog/EditDialog';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCaptureRequest, IMarkingPostData } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import MarkingCardContainer from './MarkingCardContainer';

/**
 * Returns the control for applying markings to an animal on the animal capture form
 *
 * @returns
 */
const CaptureMarkingsForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const critterbaseApi = useCritterbaseApi();

  const { critterDataLoader } = useAnimalPageContext();

  const { values, setFieldValue } = useFormikContext<ICreateCaptureRequest>();

  const index = values.markings.length;

  // TODO: consolidate lookups into a single endpoint in critterbase
  const markingTypesDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingTypeOptions());
  const markingBodyLocationDataLoader = useDataLoader((tsn: number) =>
    critterbaseApi.marking.getMarkingBodyLocationOptions(tsn)
  );
  const markingColoursDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingColourOptions());

  if (!markingTypesDataLoader.data) {
    markingTypesDataLoader.load();
  }

  if (!markingColoursDataLoader.data) {
    markingColoursDataLoader.load();
  }

  if (!markingBodyLocationDataLoader.data) {
    if (critterDataLoader.data) {
      markingBodyLocationDataLoader.load(critterDataLoader.data.itis_tsn);
    }
  }

  const handleSave = (data: IMarkingPostData) => {
    setFieldValue(`markings.[${index}]`, data);
    setIsDialogOpen(false);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Marking'}
        open={isDialogOpen}
        onCancel={handleClose}
        onSave={handleSave}
        size="md"
        // dialogLoading={loading}
        component={{
          initialValues: {
            marking_type_id: '',
            taxon_marking_body_location_id: '',
            identifier: '',
            primary_colour_id: '',
            secondary_colour_id: null,
            comment: ''
          },
          validationSchema: yup.object({ marking_id: yup.string().optional() }), //CreateCritterMarkingSchema,
          element: (
            <Stack gap={2}>
              <AutocompleteField
                id="marking-type-autocomplete-field"
                label="Marking Type"
                loading={markingTypesDataLoader.isLoading}
                name={`marking_type_id`}
                required
                options={
                  markingTypesDataLoader.data?.map((item) => ({
                    value: item.marking_type_id,
                    label: item.name
                  })) ?? []
                }
              />
              <AutocompleteField
                id="marking-location-autocomplete-field"
                label="Marking Placement"
                name={`body_location_id`}
                required
                loading={markingBodyLocationDataLoader.isLoading}
                options={
                  markingBodyLocationDataLoader.data?.map((item) => ({
                    value: item.taxon_marking_body_location_id,
                    label: item.body_location
                  })) ?? []
                }
              />
              <AutocompleteField
                id="marking-primary-colour-autocomplete-field"
                label="Primary colour"
                name={`primary_colour_id`}
                loading={markingColoursDataLoader.isLoading}
                options={markingColoursDataLoader.data?.map((item) => ({ value: item.id, label: item.value })) ?? []}
              />
              <AutocompleteField
                id="marking-secondary-colour-autocomplete-field"
                label="Secondary colour"
                name={`secondary_colour_id`}
                loading={markingColoursDataLoader.isLoading}
                options={markingColoursDataLoader.data?.map((item) => ({ value: item.id, label: item.value })) ?? []}
              />
              <CustomTextField
                name={`comment`}
                label="Description"
                other={{ multiline: true, rows: 4 }}
              />
            </Stack>
          )
        }}
      />

      <MarkingCardContainer />

      <Button
        color="primary"
        variant="outlined"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add marking"
        onClick={() => setIsDialogOpen(true)}>
        Add Marking
      </Button>
    </>
  );
};

export default CaptureMarkingsForm;
