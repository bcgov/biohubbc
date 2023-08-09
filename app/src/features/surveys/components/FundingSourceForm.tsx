import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DollarAmountField from 'components/fields/DollarAmountField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';

export interface ISurveyFundingSource {
  funding_source_id: number;
  amount: string | undefined;
  revision_count: number;
  survey_funding_source_id: number;
  survey_id: number;
}

export interface ISurveyFundingSourceForm {
  funding_sources: ISurveyFundingSource[]
}

export const FundingSourceFormInitialValues: ISurveyFundingSourceForm = {
  funding_sources: []
};

export const FundingSourceFormYupSchema = yup.object().shape({
  funding_sources: yup.array()
});


export const FundingSourceInitialValues: ISurveyFundingSource = {
  funding_source_id: 0,
  amount: undefined,
  revision_count: 0,
  survey_funding_source_id: 0,
  survey_id: 0
};

export const FundingSourceYupSchema = yup.object().shape(
  {
    funding_source_id: yup
      .number()
      .required('Must select a Funding Source')
      .min(1, 'Must select a valid Funding Source'), // TODO confirm that this is not triggered when the autocomplete is empty.
    funding_amount: yup
      .number()
      .transform((value) => (isNaN(value) && null) || value)
      .typeError('Must be a number')
      .min(0, 'Must be a positive number')
      .max(9999999999, 'Cannot exceed $9,999,999,999'),
  }
);

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const FundingSourceForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleSubmit } = formikProps;
  const [loadingFundingSources, setLoadingFundingSources] = useState<boolean>(true);

  return (
    <form onSubmit={handleSubmit}>
  
      <FieldArray
        name="funding.fundingSources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            {values.funding_sources.map((surveyFundingSource, index) => {
              return (
                <Box mb={3} display='flex' gap={2} alignItems='center'>
                  <Autocomplete
                    id={`survey-funding-form-funding-source-${index}`}
                    sx={{ flex: 6 }}
                    //isOptionEqualToValue={(option, value) => option.title === value.title}
                    //getOptionLabel={(option) => option.title}
                    options={[]}
                    loading={loadingFundingSources}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Funding Source"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingFundingSources ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  <DollarAmountField
                    id={`survey-funding-form-dollar-amount-${index}`}
                    name="funding_amount"
                    label="Funding Amount"
                    sx={{ flex: 4 }}
                  />
                  <Box>
                    <IconButton
                      data-testid={`funding-form-delete-button-${index}`}
                      title="Remove Funding Source"
                      aria-label="Remove Funding Source"
                      onClick={() => arrayHelpers.remove(index)}
                      sx={{ ml: -1 }}
                      >
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
            <Button
              data-testid="funding-form-add-button"
              variant="outlined"
              color="primary"
              title="Add Funding Source"
              aria-label="Add Funding Source"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => {
                /*
                setCurrentProjectFundingFormArrayItem({
                  index: values.funding.fundingSources.length,
                  values: ProjectFundingFormArrayItemInitialValues
                });
                setIsModalOpen(true);
                */
              }}>
              Add Funding Source
            </Button>
          </Box>    
        )}
      />
    </form>
  );
};

export default FundingSourceForm;
