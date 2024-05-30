import Stack from '@mui/material/Stack';
import EditDialog from 'components/dialog/EditDialog';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMarkingPostData } from 'interfaces/useCritterApi.interface';
import {
  IMarkingBodyLocationResponse,
  IMarkingColourOption,
  IMarkingTypeResponse
} from 'interfaces/useMarkingApi.interface';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';

interface IMarkingsDialogProps {
  initialValues?: IMarkingPostData;
  markingColours: IMarkingColourOption[];
  markingBodyLocations: IMarkingBodyLocationResponse[];
  markingTypes: IMarkingTypeResponse[];
  isDialogOpen: boolean;
  handleClose: () => void;
  handleSave: (data: IMarkingPostData) => void;
}

/**
 * Animal markings dialog.
 *
 * @param {IMarkingsDialogProps} props
 * @return {*}
 */
export const MarkingsDialog = (props: IMarkingsDialogProps) => {
  const { initialValues, isDialogOpen, handleSave, handleClose, markingBodyLocations, markingColours, markingTypes } =
    props;

  const animalMarkingYupSchema = yup.object({
    marking_type_id: yup.string().required('Marking type is required.'),
    taxon_marking_body_location_id: yup.string().required('Marking body location is required.'),
    identifier: yup.string().nullable(),
    primary_colour_id: yup.string().nullable(),
    secondary_colour_id: yup.string().nullable(),
    comment: yup.string().nullable()
  });

  return (
    <EditDialog
      dialogTitle={'Add Marking'}
      open={isDialogOpen}
      onCancel={handleClose}
      onSave={handleSave}
      size="md"
      component={{
        initialValues: initialValues ?? {
          _id: v4(),
          marking_type_id: '',
          taxon_marking_body_location_id: '',
          identifier: null,
          primary_colour_id: null,
          secondary_colour_id: null,
          comment: null
        },
        validationSchema: animalMarkingYupSchema,
        element: (
          <Stack gap={2}>
            <Stack gap={1} direction="row">
              <AutocompleteField
                sx={{ flex: '0.5' }}
                id="marking-type-autocomplete-field"
                label="Marking type"
                name={`marking_type_id`}
                required
                options={
                  markingTypes.map((item) => ({
                    value: item.marking_type_id,
                    label: item.name
                  })) ?? []
                }
              />

              <AutocompleteField
                sx={{ flex: '0.5' }}
                id="marking-location-autocomplete-field"
                label="Marking placement"
                name={`taxon_marking_body_location_id`}
                required
                options={
                  markingBodyLocations?.map((item) => ({
                    value: item.taxon_marking_body_location_id,
                    label: item.body_location
                  })) ?? []
                }
              />
            </Stack>
            <CustomTextField
              name={`identifier`}
              aria-label="Unique marking ID"
              label="Identifier"
              other={{ rows: 1, autoComplete: 'off' }}
            />
            <Stack gap={1} direction="row">
              <AutocompleteField
                sx={{ flex: '0.5' }}
                id="marking-primary-colour-autocomplete-field"
                label="Primary colour"
                name={`primary_colour_id`}
                options={markingColours?.map((item) => ({ value: item.colour_id, label: item.colour })) ?? []}
              />
              <AutocompleteField
                sx={{ flex: '0.5' }}
                id="marking-secondary-colour-autocomplete-field"
                label="Secondary colour"
                name={`secondary_colour_id`}
                options={markingColours.map((item) => ({ value: item.colour_id, label: item.colour })) ?? []}
              />
            </Stack>
            <CustomTextField name={`comment`} label="Comment" other={{ multiline: true, rows: 4 }} />
          </Stack>
        )
      }}
    />
  );
};
