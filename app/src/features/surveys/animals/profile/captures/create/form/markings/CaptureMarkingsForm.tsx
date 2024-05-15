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
import { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';

import { TransitionGroup } from 'react-transition-group';
import MarkingCard from './MarkingCard';
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

  // Get available marking types
  const markingTypesDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingTypeOptions());

  // Get available marking body positions
  const markingBodyLocationDataLoader = useDataLoader((tsn: number) =>
    critterbaseApi.marking.getMarkingBodyLocationOptions(tsn)
  );

  // Get available marking colours
  const markingColoursDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingColourOptions());

  // Load marking types
  useEffect(() => {
    if (!markingTypesDataLoader.data) {
      markingTypesDataLoader.load();
    }
  }, [markingTypesDataLoader.data]);

  // Load marking colours
  useEffect(() => {
    if (!markingColoursDataLoader.data) {
      markingColoursDataLoader.load();
    }
  }, [markingColoursDataLoader.data]);

  // Load marking body locations
  useEffect(() => {
    if (!markingBodyLocationDataLoader.data && critterDataLoader.data) {
      markingBodyLocationDataLoader.load(critterDataLoader.data.itis_tsn);
    }
  }, [markingBodyLocationDataLoader.data, critterDataLoader.data]);

  const handleSave = (data: IMarkingPostData) => {
    setFieldValue(`markings.[${values.markings.length}]`, data);
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
          validationSchema: yup.object({ marking_id: yup.string().optional() }),
          element: (
            <Stack gap={2}>
              <AutocompleteField
                id="marking-type-autocomplete-field"
                label="Marking type"
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
                label="Marking placement"
                name={`taxon_marking_body_location_id`}
                required
                loading={markingBodyLocationDataLoader.isLoading}
                options={
                  markingBodyLocationDataLoader.data?.map((item) => ({
                    value: item.taxon_marking_body_location_id,
                    label: item.body_location
                  })) ?? []
                }
              />
              <CustomTextField
                name={`identifier`}
                aria-label="Unique marking ID"
                label="Identifier"
                other={{ rows: 1, autoComplete: 'off' }}
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
              <CustomTextField name={`comment`} label="Comment" other={{ multiline: true, rows: 4 }} />
            </Stack>
          )
        }}
      />
      <Stack gap={3}>
        <TransitionGroup>
          {values.markings.map((marking) => {
            console.log(markingBodyLocationDataLoader.data);
            console.log(marking.taxon_marking_body_location_id)
            console.log(
              markingBodyLocationDataLoader.data?.find(
                (body_location) =>
                  body_location.taxon_marking_body_location_id == marking.taxon_marking_body_location_id
              )
            );

            return (
              <MarkingCard
                key={`${marking.taxon_marking_body_location_id}-${marking.marking_type_id}`}
                identifier={marking.identifier}
                comment={marking.comment}
                primary_colour_label={
                  markingColoursDataLoader.data?.find((colour) => colour.id == marking.primary_colour_id)?.value
                }
                secondary_colour_label={
                  markingColoursDataLoader.data?.find((colour) => colour.id == marking.secondary_colour_id)?.value
                }
                marking_type_label={
                  markingTypesDataLoader.data?.find((type) => type.marking_type_id == marking.marking_type_id)?.name ??
                  ''
                }
                marking_body_location_label={
                  markingBodyLocationDataLoader.data?.find(
                    (body_location) =>
                      body_location.taxon_marking_body_location_id == marking.taxon_marking_body_location_id
                  )?.body_location ?? ''
                }
              />
            );
          })}
        </TransitionGroup>
      </Stack>
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
