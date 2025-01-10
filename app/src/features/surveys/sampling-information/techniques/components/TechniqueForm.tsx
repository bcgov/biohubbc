import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { TechniqueAttributesForm } from 'features/surveys/sampling-information/techniques/components/attributes/TechniqueAttributesForm';
import {
  CreateTechniqueFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { TechniqueAttractantsForm } from './attractants/TechniqueAttractantsForm';
import { TechniqueDetailsForm } from './details/TechniqueDetailsForm';
import { TechniqueGeneralInformationForm } from './general-information/TechniqueGeneralInformationForm';
import { TechniqueVantageForm } from './vantages/TechniqueVantagesForm';

/**
 * Technique form.
 *
 * Handles creating and editing a technique.
 *
 * @template FormValues
 * @return {*}
 */
export const TechniqueForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>() => {
  const { values } = useFormikContext<FormValues>();

  const biohubApi = useBiohubApi();

  const attributeTypeDefinitionDataLoader = useDataLoader((method_lookup_id: number) =>
    biohubApi.reference.getTechniqueAttributes([method_lookup_id])
  );

  const vantageReferenceRecordsDataLoader = useDataLoader((methodLookupId: number) =>
    biohubApi.reference.getVantageReferenceRecords([methodLookupId])
  );

  useEffect(() => {
    if (values.method_lookup_id) {
      // Fetch attribute type definitions based on the selected method
      attributeTypeDefinitionDataLoader.refresh(values.method_lookup_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.method_lookup_id]);

  const attributeTypeDefinitions = useMemo(
    () =>
      attributeTypeDefinitionDataLoader.data?.flatMap((attribute) => [
        ...(attribute.qualitative_attributes ?? []),
        ...(attribute.quantitative_attributes ?? [])
      ]) ?? [],
    [attributeTypeDefinitionDataLoader.data]
  );

  // Refresh vantage reference data when the method lookup changes
  useEffect(() => {
    if (!values.method_lookup_id) {
      return;
    }
    vantageReferenceRecordsDataLoader.refresh(values.method_lookup_id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.method_lookup_id]);

  return (
    <Stack>
      <HorizontalSplitFormComponent title="General Information" summary="Enter information about the technique">
        <TechniqueGeneralInformationForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <TransitionGroup>
        {vantageReferenceRecordsDataLoader.data && vantageReferenceRecordsDataLoader.data.length > 0 && (
          <Collapse>
            <HorizontalSplitFormComponent title="Vantages" summary="Enter information about the technique vantages">
              <TechniqueVantageForm vantageReferenceRecords={vantageReferenceRecordsDataLoader.data ?? []} />
            </HorizontalSplitFormComponent>

            <Divider sx={{ my: 5 }} />
          </Collapse>
        )}
      </TransitionGroup>

      <TransitionGroup>
        {attributeTypeDefinitions.length > 0 && (
          <Collapse in={!!attributeTypeDefinitions.length}>
            <HorizontalSplitFormComponent title="Details" summary="Enter additional information about the technique">
              <TechniqueAttributesForm attributeTypeDefinitions={attributeTypeDefinitions} />
            </HorizontalSplitFormComponent>

            <Divider sx={{ my: 5 }} />
          </Collapse>
        )}
      </TransitionGroup>

      <HorizontalSplitFormComponent
        title="Attractants"
        summary="Enter any attractants used to lure species during the technique">
        <TechniqueAttractantsForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent title="Methodology" summary="Enter details about the technique">
        <TechniqueDetailsForm />
      </HorizontalSplitFormComponent>
    </Stack>
  );
};
