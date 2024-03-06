import { Button, Grid } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import {
  AnimalMarkingSchema,
  ANIMAL_FORM_MODE,
  getAnimalFieldName,
  IAnimal,
  IAnimalMarking,
  isRequiredInSchema
} from '../animal';
import { ANIMAL_SECTIONS_FORM_MAP } from '../animal-sections';

type MarkingAnimalFormProps =
  | {
      itis_tsn: string; // temp will probably place inside a context
      display: 'button';
      marking?: never;
    }
  | {
      itis_tsn: string;
      display: 'card';
      marking: IAnimalMarking;
    };
/*
 * Note: This is a placeholder component for how to handle the form sections individually
 * allows easier management of the individual form sections with push / patch per form
 * vs how it's currently implemented with one large payload that updates/removes/creates critter meta
 */
export const MarkingAnimalForm = (props: MarkingAnimalFormProps) => {
  const [dialogMode, setDialogMode] = useState<ANIMAL_FORM_MODE | null>(null);
  const markingInfo = ANIMAL_SECTIONS_FORM_MAP['Markings'];
  return (
    <>
      <EditDialog
        dialogTitle={markingInfo.dialogTitle}
        open={!!dialogMode}
        component={{
          element: <div>placeholder for marking component</div>,
          initialValues: props?.marking ?? markingInfo.defaultFormValue(),
          validationSchema: AnimalMarkingSchema
        }}
        onCancel={() => setDialogMode(null)}
        onSave={(values) => {
          setDialogMode(null);
        }}
      />
      {props.display === 'button' ? (
        <Button onClick={() => setDialogMode(ANIMAL_FORM_MODE.ADD)}>{markingInfo.addBtnText}</Button>
      ) : (
        <EditDeleteStubCard header={props?.marking?.marking_type ?? 'Marking'} subHeader={'test test'} />
      )}
    </>
  );
};

interface IMarkingAnimalFormContentProps {
  index: number;
}

export const MarkingAnimalFormContent = ({ index }: IMarkingAnimalFormContentProps) => {
  const name: keyof IAnimal = 'markings';

  const { values, setFieldValue } = useFormikContext<IAnimal>();

  const handlePrimaryColourName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'primary_colour', index), label);
  };

  const handleMarkingTypeName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'marking_type', index), label);
  };

  const handleMarkingLocationName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'body_location', index), label);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CbSelectField
          label="Type"
          name={getAnimalFieldName<IAnimalMarking>(name, 'marking_type_id', index)}
          id="marking_type"
          route="lookups/marking-types"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'marking_type_id')
          }}
          handleChangeSideEffect={handleMarkingTypeName}
        />
      </Grid>
      <Grid item xs={12}>
        <CbSelectField
          label="Body Location"
          name={getAnimalFieldName<IAnimalMarking>(name, 'taxon_marking_body_location_id', index)}
          id="marking_body_location"
          route="xref/taxon-marking-body-locations"
          query={{ tsn: values.general.itis_tsn }}
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'taxon_marking_body_location_id')
          }}
          handleChangeSideEffect={handleMarkingLocationName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CbSelectField
          label="Primary Colour"
          name={getAnimalFieldName<IAnimalMarking>(name, 'primary_colour_id', index)}
          id="primary_colour_id"
          route="lookups/colours"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'primary_colour_id')
          }}
          handleChangeSideEffect={handlePrimaryColourName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CbSelectField
          label="Secondary Colour"
          name={getAnimalFieldName<IAnimalMarking>(name, 'secondary_colour_id', index)}
          id="secondary_colour_id"
          route="lookups/colours"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'secondary_colour_id')
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          label="Comments"
          name={getAnimalFieldName<IAnimalMarking>(name, 'marking_comment', index)}
          other={{
            size: 'medium',
            multiline: true,
            minRows: 3,
            required: isRequiredInSchema(AnimalMarkingSchema, 'marking_comment')
          }}
        />
      </Grid>
      <FormikDevDebugger />
    </Grid>
  );
};
