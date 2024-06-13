import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { TechniqueFormValues } from 'features/surveys/technique/form/components/TechniqueForm';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetTechniqueAttributes } from 'interfaces/useReferenceApi.interface';

import { useEffect } from 'react';

interface ITechniqueGeneralInformationFormProps {
  attributeTypeDefinitionsDataLoader: DataLoader<[method_lookup_id: number], IGetTechniqueAttributes[], undefined>;
}

/**
 * Technique general information form.
 *
 * @return {*}
 */
export const TechniqueGeneralInformationForm = (props: ITechniqueGeneralInformationFormProps) => {
  const attributeTypeDefinitionDataLoader = props.attributeTypeDefinitionsDataLoader;

  const codesContext = useCodesContext();

  const { setFieldValue, values } = useFormikContext<TechniqueFormValues>();

  const methodOptions: ISelectWithSubtextFieldOption[] =
    codesContext.codesDataLoader.data?.sample_methods.map((option) => ({
      value: option.id,
      label: option.name,
      subText: option.description
    })) ?? [];

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    if (values.method_lookup_id) {
      attributeTypeDefinitionDataLoader.load(values.method_lookup_id);
    }
  }, []);

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="name"
            label="Technique Name"
            maxLength={64}
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="method_lookup_id"
            label="Sampling method"
            name="method_lookup_id"
            showValue
            required
            loading={codesContext.codesDataLoader.isLoading}
            options={methodOptions.map((option) => ({
              value: option.value as number,
              label: option.label,
              description: option.subText
            }))}
            onChange={(_, value) => {
              if (value?.value) {
                setFieldValue('method_lookup_id', value.value);

                // Fetch type definitions for the newly selected method_lookup_id
                attributeTypeDefinitionDataLoader.refresh(value.value);

                // Reset attributes when the method_lookup_id changes
                setFieldValue('attributes', []);
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="description"
            label="Description"
            maxLength={1000}
            other={{
              multiline: true,
              rows: 4
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
