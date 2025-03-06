import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import {
  CreateTechniqueFormValues,
  TechniqueAttributeFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';
import { TechniqueAttributeForm } from './components/TechniqueAttributeForm';

const initialAttributeFormValues: Partial<
  Pick<TechniqueAttributeFormValues, 'attribute_lookup_id' | 'attribute_value' | 'attribute_type'>
> = {
  // The attribute id (method_lookup_attribute_quantitative_id or method_lookup_attribute_qualitative_id)
  attribute_lookup_id: undefined,
  // The attribute value (quantitative value or method_lookup_attribute_qualitative_option_id)
  attribute_value: undefined,
  // The attribute type discriminator ('quantitative' or 'qualitative')
  attribute_type: undefined
};

interface ITechniqueAttributesFormProps {
  attributeTypeDefinitions: (ITechniqueAttributeQualitative | ITechniqueAttributeQuantitative)[];
}

/**
 * Technique attributes form.
 *
 * Handles creating and editing a technique's attributes.
 *
 * @template FormValues
 * @param {ITechniqueAttributesFormProps} props
 * @return {*}
 */
export const TechniqueAttributesForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueAttributesFormProps
) => {
  const { attributeTypeDefinitions } = props;

  const { values } = useFormikContext<FormValues>();

  return (
    <FieldArray
      name="attributes"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.attributes.map((attribute, index) => {
              return (
                // Quantitative and qualitative measurements might have the same attribute_id, so use temporary _id
                <Collapse key={attribute.attribute_id ?? attribute._id}>
                  <Box mb={2}>
                    <TechniqueAttributeForm
                      attributeTypeDefinitions={attributeTypeDefinitions}
                      arrayHelpers={arrayHelpers}
                      index={index}
                    />
                  </Box>
                </Collapse>
              );
            })}
          </TransitionGroup>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add attribute"
            disabled={values.attributes.length >= attributeTypeDefinitions.length}
            onClick={() => {
              // When a new measurement is added, _id is created as its unique key.
              // Attribute_id, which represents the DB primary key, is null for records that don't yet exist in the DB.
              arrayHelpers.push({ ...initialAttributeFormValues, _id: v4(), attribute_id: null });
            }}>
            Add Attribute
          </Button>
        </>
      )}
    />
  );
};
