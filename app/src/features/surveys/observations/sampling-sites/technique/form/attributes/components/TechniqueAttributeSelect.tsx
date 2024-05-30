import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useMemo } from 'react';

interface ICaptureTechniqueAttributeSelectProps {
  attributes: (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species.
 *
 * @param {ICaptureTechniqueAttributeSelectProps} props
 * @return {*}
 */
const TechniqueAttributeSelect = (props: ICaptureTechniqueAttributeSelectProps) => {
  const { arrayHelpers, attributes, index } = props;

  const { values, setFieldValue } = useFormikContext<ICreateTechniqueRequest>();

  const value = values.attributes[index];

  const selectedAttribute =
    attributes.find((attribute) => {
      if ('method_lookup_attribute_qualitative_id' in attribute && 'method_lookup_attribute_qualitative_id' in value) {
        return attribute.method_lookup_attribute_qualitative_id === value.method_lookup_attribute_qualitative_id;
      }

      if (
        'method_lookup_attribute_quantitative_id' in attribute &&
        'method_lookup_attribute_quantitative_id' in value
      ) {
        return attribute.method_lookup_attribute_quantitative_id === value.method_lookup_attribute_quantitative_id;
      }
    }) ?? null;

  // Filter out the attributes that are already selected so they can't be selected again
  const filteredAttributes = useMemo(
    () =>
      attributes
        .filter(
          (attribute) =>
            !values.attributes.some(
              (existing) =>
                ('method_lookup_attribute_quantitative_id' in attribute &&
                  'method_lookup_attribute_quantitative_id' in existing &&
                  existing.method_lookup_attribute_quantitative_id ===
                    attribute.method_lookup_attribute_quantitative_id) ||
                ('method_lookup_attribute_qualitative_id' in attribute &&
                  'method_lookup_attribute_qualitative_id' in existing &&
                  existing.method_lookup_attribute_qualitative_id === attribute.method_lookup_attribute_qualitative_id)
            )
        )
        .map((option) => ({
          value:
            ('method_lookup_attribute_qualitative_id' in option && option.method_lookup_attribute_qualitative_id) ||
            ('method_lookup_attribute_quantitative_id' in option && option.method_lookup_attribute_quantitative_id) ||
            0,
          label: option.name,
          description: option.description
        })),
    [attributes, values.attributes, selectedAttribute?.name, index]
  );

  return (
    <Collapse in role="listitem">
      <Card
        component={Stack}
        variant="outlined"
        flexDirection="row"
        alignItems="flex-start"
        gap={2}
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: grey[100]
        }}>
        <AutocompleteField
          id={'technique-attribute-autocomplete'}
          name={'technique-attribute-autocomplete'}
          label="Measurement"
          options={filteredAttributes}
          onChange={(_, option) => {
            if (option?.value) {
              setFieldValue(`attributes.[${index}]`, {
                attribute_id: option.value,
                type: 'method_lookup_attribute_qualitative_id' in option ? 'qualitative' : 'quantitative'
              });
            }
          }}
          required
          sx={{
            flex: '0.5'
          }}
        />

        {/* <Box flex="0.5">
          {selectedAttribute && 'options' in selectedAttribute ? (
            <TechniqueAttributeOptionSelect
              formikName="qualitative_attributes"
              index={index}
              options={selectedAttribute.options.map((option) => ({
                label: option.name,
                value: option.method_lookup_attribute_qualitative_option_id
              }))}
              label="Value"
            />
          ) : (
            <CustomTextField
              name={`quantitative_attributes.[${index}].value`}
              label={`Value ${selectedAttribute?.unit ? `(${selectedAttribute.unit})` : ''}`}
              other={{
                required: true,
                type: 'number',
                placeholder: 'Value'
              }}
            />
          )}
        </Box> */}

        <IconButton
          data-testid={`attribute-delete-button-${index}`}
          title="Remove attribute"
          aria-label="Remove attribute"
          onClick={() => arrayHelpers.remove(index)}
          sx={{ mt: 1.125 }}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Card>
    </Collapse>
  );
};

export default TechniqueAttributeSelect;
