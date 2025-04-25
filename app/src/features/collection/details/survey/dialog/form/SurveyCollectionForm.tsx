import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArray, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

export interface ISurveyCollectionData {
  surveys: { survey_id: number }[];
}

/**
 * Form for adding a survey to multiple collections
 *
 * NOTE: On naming conventions, SurveyCollectionForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas CollectionSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @returns {*}
 */
const SurveyCollectionForm = () => {
  const { values } = useFormikContext<ISurveyCollectionData>();

  const biohubApi = useBiohubApi();
  const surveysDataLoader = useDataLoader(() => biohubApi.survey.findSurveys());

  useEffect(() => {
    surveysDataLoader.load();
  }, [surveysDataLoader]);

  return (
    <form>
      <FieldArray
        name="surveys"
        render={(arrayHelpers) => (
          <>
            <Box component="fieldset" mb={1}>
              {/* Dropdown to add new survey to the array */}
              <AutocompleteField
                label="Surveys"
                id="surveys"
                name="surveys"
                options={
                  surveysDataLoader.data?.surveys.map((survey) => ({
                    value: survey.survey_id,
                    label: survey.name
                  })) ?? []
                }
                onChange={(_, selectedOption) => {
                  if (selectedOption && !values.surveys.some((survey) => survey.survey_id === selectedOption.value)) {
                    arrayHelpers.push({ survey_id: selectedOption.value });
                  }
                }}
              />
            </Box>

            {/* Cards for current values */}
            <Box>
              <TransitionGroup>
                {values.surveys.map((survey, index) => {
                  const surveyMeta = surveysDataLoader.data?.surveys.find(
                    (existing) => existing.survey_id === survey.survey_id
                  );

                  return (
                    <Collapse key={survey.survey_id}>
                      <Box my={0.5}>
                        <NameDescriptionCard
                          label={surveyMeta?.name ?? ''}
                          onDelete={() => arrayHelpers.remove(index)}
                        />
                      </Box>
                    </Collapse>
                  );
                })}
              </TransitionGroup>
            </Box>
          </>
        )}
      />
    </form>
  );
};

export default SurveyCollectionForm;
