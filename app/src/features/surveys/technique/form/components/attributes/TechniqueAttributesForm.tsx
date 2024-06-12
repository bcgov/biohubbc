import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import {
  TechniqueAttributeFormValues,
  TechniqueFormValues
} from 'features/surveys/technique/form/components/TechniqueForm';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';
import { TechniqueAttributeForm } from './components/TechniqueAttributeForm';

const initialAttributeFormValues: Partial<TechniqueAttributeFormValues> = {
  // The attribute id (method_lookup_attribute_quantitative_id or method_lookup_attribute_qualitative_id)
  attribute_lookup_id: undefined,
  // The attribute value (quantitative value or method_lookup_attribute_qualitative_option_id)
  attribute_value: undefined,
  // The attribute type discriminator ('quantitative' or 'qualitative')
  attribute_type: undefined
};

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
export const TechniqueAttributesForm = () => {
  const biohubApi = useBiohubApi();

  const { values } = useFormikContext<TechniqueFormValues>();

  const attributeTypeDefinitionDataLoader = useDataLoader((method_lookup_id: number) =>
    biohubApi.reference.getTechniqueAttributes([method_lookup_id])
  );

  const attributeTypeDefinitions = useMemo(
    () =>
      attributeTypeDefinitionDataLoader.data?.flatMap((attribute) => [
        ...attribute.qualitative_attributes,
        ...attribute.quantitative_attributes
      ]) ?? [],
    [attributeTypeDefinitionDataLoader.data]
  );

  useEffect(() => {
    if (!values.method_lookup_id) {
      return;
    }

    attributeTypeDefinitionDataLoader.load(values.method_lookup_id);
  }, [values.method_lookup_id, attributeTypeDefinitionDataLoader]);

  return (
    <FieldArray
      name="attributes"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.attributes.map((attribute, index) => {
              return (
                // Quantitative and qualitative measurements might have the same attribute_id, so use temporary _id
                <Collapse key={attribute._id}>
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
            disabled={!values.method_lookup_id || values.attributes.length >= attributeTypeDefinitions.length}
            onClick={() => {
              // When a new measurement is added, _id is created for a unique key.
              // attribute_id, which represents the DB primary key, is null for records that don't yet exist in the DB.
              arrayHelpers.push({ ...initialAttributeFormValues, _id: v4(), attribute_id: null });
            }}>
            Add Attribute
          </Button>
        </>
      )}
    />
  );
};
