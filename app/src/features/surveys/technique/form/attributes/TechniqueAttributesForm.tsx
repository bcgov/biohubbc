import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';
import TechniqueAttributeSelect from './components/TechniqueAttributeSelect';

const initialAttributeValues = {
  method_lookup_attribute_quantitative_id: undefined,
  value: undefined,
  method_lookup_attribute_qualitative_id: undefined,
  method_lookup_attribute_qualitative_option_id: undefined
};

interface ITechniqueAttributesFormProps {
  selectedMethodLookupId: number | null;
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const TechniqueAttributesForm = (props: ITechniqueAttributesFormProps) => {
  const biohubApi = useBiohubApi();
  const { selectedMethodLookupId } = props;

  const { values } = useFormikContext<ICreateTechniqueRequest>();

  const attributesDataLoader = useDataLoader((method_lookup_id: number) =>
    biohubApi.reference.getTechniqueAttributes([method_lookup_id])
  );

  useEffect(() => {
    if (!selectedMethodLookupId) {
      return;
    }

    attributesDataLoader.load(selectedMethodLookupId);
  }, [selectedMethodLookupId, attributesDataLoader]);

  const attributes =
    attributesDataLoader.data?.flatMap((attribute) => [
      ...attribute.qualitative_attributes,
      ...attribute.quantitative_attributes
    ]) ?? [];

  return (
    <FieldArray
      name="attributes"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.attributes.map((attribute, index) => (
              <Collapse in={true} key={attribute.attribute_id || index}>
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
            onClick={() => {
              arrayHelpers.push(initialAttributeValues);
            }}>
            Add Attribute
          </Button>
        </>
      )}
    />
  );
};

export default TechniqueAttributesForm;
