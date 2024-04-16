import SpeciesAutocompleteField, {
  ISpeciesAutocompleteFieldProps
} from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { get } from 'lodash-es';
import { useEffect } from 'react';

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

  const { values, touched, errors, setFieldValue, setFieldError } = useFormikContext();
  const { data: taxon, load: loadTaxon, clearData } = useDataLoader(bhApi.taxonomy.getSpeciesFromIds);

  const tsn = get(values, props.formikFieldName);

  if (tsn) {
    loadTaxon([tsn]);
  }

  useEffect(() => {
    if (!tsn) {
      clearData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsn]);

  return (
    <SpeciesAutocompleteField
      key={`${taxon?.[0].tsn}-formik-species-auto-complete`}
      formikFieldName={props.formikFieldName}
      disabled={props.disabled}
      label={'Species'}
      required={props.required}
      error={Boolean(get(touched, props.formikFieldName)) && get(errors, props.formikFieldName)}
      defaultSpecies={taxon?.[0]}
      handleSpecies={(taxon) => {
        if (taxon) {
          setFieldValue(props.formikFieldName, taxon.tsn);
          setFieldError(props.formikFieldName, undefined);
        } else {
          clearData();
          setFieldValue(props.formikFieldName, '');
        }
      }}
    />
  );
};
