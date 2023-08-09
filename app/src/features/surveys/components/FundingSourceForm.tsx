import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Autocomplete, CircularProgress, TextField, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import EditDialog from 'components/dialog/EditDialog';
import DollarAmountField from 'components/fields/DollarAmountField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AddFundingI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';

export interface IProjectFundingFormArrayItem {
  id: number;
  agency_id?: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_project_id: string;
  funding_amount?: number;
  start_date?: string;
  end_date?: string;
  revision_count: number;
  first_nations_id?: number;
}

export const ProjectFundingFormArrayItemInitialValues: IProjectFundingFormArrayItem = {
  id: 0,
  agency_id: '' as unknown as number,
  investment_action_category: '' as unknown as number,
  investment_action_category_name: '',
  agency_project_id: '',
  funding_amount: undefined,
  start_date: undefined,
  end_date: undefined,
  revision_count: 0,
  first_nations_id: undefined
};

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape(
  {
    // if agency_id is present, first_nations_id is no longer required
    agency_id: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable(true)
      .when('first_nations_id', {
        is: (first_nations_id: number) => !first_nations_id,
        then: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('Required'),
        otherwise: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .nullable(true)
      }),
    // if first_nations_id is present, agency_id is no longer required
    first_nations_id: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable(true)
      .when('agency_id', {
        is: (agency_id: number) => !agency_id,
        then: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('Required'),
        otherwise: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .nullable(true)
      }),
    investment_action_category: yup.number().nullable(true),
    agency_project_id: yup.string().max(50, 'Cannot exceed 50 characters').nullable(true),
    // funding amount is not required when a first nation is selected as a funding source
    funding_amount: yup
      .number()
      .transform((value) => (isNaN(value) && null) || value)
      .typeError('Must be a number')
      .min(0, 'Must be a positive number')
      .max(9999999999, 'Must be less than $9,999,999,999')
      .when('first_nations_id', (val: any) => {
        const rules = yup
          .number()
          .transform((value) => (isNaN(value) && null) || value)
          .typeError('Must be a number')
          .min(0, 'Must be a positive number')
          .max(9999999999, 'Must be less than $9,999,999,999');
        if (!val) {
          return rules.required('Required');
        }

        return rules.nullable(true);
      }),
    start_date: yup.string().when('first_nations_id', (val: any) => {
      const rules = yup.string().isValidDateString();
      if (!val) {
        return rules.required('Required');
      }
      return rules.nullable(true);
    }),
    end_date: yup.string().when('first_nations_id', (val: any) => {
      const rules = yup.string().isValidDateString().isEndDateAfterStartDate('start_date');
      if (!val) {
        return rules.required('Required');
      }
      return rules.nullable(true);
    })
  },
  [['agency_id', 'first_nations_id']] // this prevents a cyclical dependency
);

export enum FundingSourceType {
  FUNDING_SOURCE,
  FIRST_NATIONS
}
export interface IFundingSourceAutocompleteField {
  value: number;
  label: string;
  type: FundingSourceType;
}
export interface IProjectFundingItemFormProps {
  sources: IFundingSourceAutocompleteField[];
  investment_action_category: IInvestmentActionCategoryOption[];
}


export interface IFundingSourceForm {
  funding: {
    fundingSources: any[]; // TODO
  };
}

export const FundingSourceFormInitialValues: IFundingSourceForm = {
  funding: {
    fundingSources: []
  }
};

export const FundingSourceFormYupSchema = yup.object().shape({});

export interface IInvestmentActionCategoryOption extends IMultiAutocompleteFieldOption {
  agency_id: number;
}

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const FundingSourceForm = () => {
  const formikProps = useFormikContext<ICreateProjectRequest>();
  const { values, handleSubmit } = formikProps;
  const [loadingFundingSources, setLoadingFundingSources] = useState<boolean>(true);

  const _tempFundingSources = [0, 1]

  return (
    <form onSubmit={handleSubmit}>
  
      <FieldArray
        name="funding.fundingSources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            {_tempFundingSources.map((fundingSource, index) => {
              return (
                <Box mb={3} display='flex' gap={2} alignItems='center'>
                  <Autocomplete
                    // id="asynchronous-demo"
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
                    id="funding_amount"
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
