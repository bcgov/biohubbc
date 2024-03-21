import SpeciesAutocompleteField, {
  ISpeciesAutocompleteFieldProps
} from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { get } from 'lodash-es';
import { default as React, useEffect } from 'react';

type SpeciesAutoCompleteFormikFieldProps = Pick<
  ISpeciesAutocompleteFieldProps,
  'formikFieldName' | 'required' | 'disabled'
>;

/**
 * This component renders a ITIS 'Species Autocomplete Field' as Formik field.
 *
 * Must be a child of a Formik form.
 *
 * @param {AnimalFormProps<IMarkingResponse>} props - Subset of SpeciesAutocompleteFieldProps.
 * @returns {*}
 */
export const SpeciesAutoCompleteFormikField = (props: SpeciesAutoCompleteFormikFieldProps) => {
  const bhApi = useBiohubApi();

  const { values, touched, errors, setFieldValue, setFieldTouched } = useFormikContext();
  const { data: taxon, load: loadTaxon, clearData } = useDataLoader(bhApi.taxonomy.getSpeciesFromIds);

  const tsn = get(values, props.formikFieldName);

  const clearField = () => {
    clearData();
    setFieldValue(props.formikFieldName, '');
  };

  if (tsn) {
    loadTaxon([tsn]);
  }

  useEffect(() => {
    if (props.disabled) {
      clearField();
    }
  }, [props.disabled]);

  return (
    <SpeciesAutocompleteField
      key={`${taxon?.[0].tsn}-formik-species-auto-complete`}
      formikFieldName={props.formikFieldName}
      disabled={props.disabled}
      label={'Taxon'}
      required={props.required}
      error={get(touched, props.formikFieldName) && Boolean(get(errors, props.formikFieldName))}
      defaultSpecies={taxon ? taxon[0] : undefined}
      handleSpecies={(taxon) => {
        if (taxon) {
          setFieldValue(props.formikFieldName, taxon.tsn);
        } else {
          clearField();
        }
        setFieldTouched(props.formikFieldName, true);
      }}
    />
  );
};
