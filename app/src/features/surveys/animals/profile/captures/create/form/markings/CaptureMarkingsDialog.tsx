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


interface ICaptureMarkingsDialogProps {
  initialValues?: IMarkingPostData;
  markingColours: IMarkingColourOption[];
  markingBodyLocations: IMarkingBodyLocationResponse[];
  markingTypes: IMarkingTypeResponse[];
  isDialogOpen: boolean;
  handleClose: () => void;
  handleSave: (data: IMarkingPostData) => void;
}

const CaptureMarkingsDialog = (props: ICaptureMarkingsDialogProps) => {
  const { initialValues, isDialogOpen, handleSave, handleClose, markingBodyLocations, markingColours, markingTypes } =
    props;

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
          identifier: '',
          primary_colour_id: '',
          secondary_colour_id: '',
          comment: ''
        },
        validationSchema: yup.object({ marking_id: yup.string().optional() }),
        element: (
          <Stack gap={2}>
            <AutocompleteField
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
              options={markingColours?.map((item) => ({ value: item.colour_id, label: item.colour })) ?? []}
            />
            <AutocompleteField
              id="marking-secondary-colour-autocomplete-field"
              label="Secondary colour"
              name={`secondary_colour_id`}
              options={markingColours.map((item) => ({ value: item.colour_id, label: item.colour })) ?? []}
            />
            <CustomTextField name={`comment`} label="Comment" other={{ multiline: true, rows: 4 }} />
          </Stack>
        )
      }}
    />
  );
};

export default CaptureMarkingsDialog;
