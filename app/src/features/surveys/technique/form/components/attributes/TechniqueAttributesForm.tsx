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
import { TechniqueAttributeSelect } from './components/TechniqueAttributeSelect';

const initialAttributeFormValues: Partial<TechniqueAttributeFormValues> = {
  // The attribute id (method_lookup_attribute_quantitative_id or method_lookup_attribute_qualitative_id)
  attribute_id: undefined,
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

  const attributesDataLoader = useDataLoader((method_lookup_id: number) =>
    biohubApi.reference.getTechniqueAttributes([method_lookup_id])
  );

  const attributes = useMemo(
    () =>
      attributesDataLoader.data?.flatMap((attribute) => [
        ...attribute.qualitative_attributes,
        ...attribute.quantitative_attributes
      ]) ?? [],
    [attributesDataLoader.data]
  );

  useEffect(() => {
    if (!values.method_lookup_id) {
      return;
    }

    attributesDataLoader.load(values.method_lookup_id);
  }, [values.method_lookup_id, attributesDataLoader]);

  return (
    <FieldArray
      name="attributes"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.attributes.map((attribute, index) => (
              <Collapse in={true} key={attribute.attribute_id ?? index}>
                <Box mb={2}>
                  <TechniqueAttributeSelect attributes={attributes} arrayHelpers={arrayHelpers} index={index} />
                </Box>
              </Collapse>
            ))}
          </TransitionGroup>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add attribute"
            disabled={!values.method_lookup_id || values.attributes.length >= attributes.length}
            onClick={() => {
              arrayHelpers.push(initialAttributeFormValues);
            }}>
            Add Attribute
          </Button>
        </>
      )}
    />
  );
};
