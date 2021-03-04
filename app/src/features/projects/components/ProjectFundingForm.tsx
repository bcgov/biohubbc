import { Box, Button, Grid, IconButton, Paper, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import * as yup from 'yup';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues
} from './ProjectFundingItemForm';

export interface IProjectFundingForm {
  funding_agencies: IProjectFundingFormArrayItem[];
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

export const ProjectFundingFormInitialValues: IProjectFundingForm = {
  funding_agencies: [],
  indigenous_partnerships: [],
  stakeholder_partnerships: []
};

export const ProjectFundingFormYupSchema = yup.object().shape({});

export interface IInvestmentActionCategoryOption extends IMultiAutocompleteFieldOption {
  fs_id: number;
}

export interface IProjectFundingFormProps {
  funding_sources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategoryOption[];
  first_nations: IMultiAutocompleteFieldOption[];
  stakeholder_partnerships: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Funding section
 *
 * @return {*}
 */
const ProjectFundingForm: React.FC<IProjectFundingFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectFundingForm>();
  const { values } = formikProps;

  // Tracks information about the current funding source item that is being added/edited
  const [currentProjectFundingFormArrayItem, setCurrentProjectFundingFormArrayItem] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Button
            variant="outlined"
            title="Add Funding Agency"
            aria-label="Add Funding Agency"
            onClick={() => {
              setCurrentProjectFundingFormArrayItem({
                index: values.funding_agencies.length,
                values: ProjectFundingFormArrayItemInitialValues
              });
              setIsModalOpen(true);
            }}>
            Add Funding Agency
          </Button>
        </Grid>
        <Grid container item direction="column">
          <FieldArray
            name="funding_agencies"
            render={(arrayHelpers) => (
              <Box>
                <Box mb={2}>
                  <ProjectFundingItemForm
                    open={isModalOpen}
                    onSubmit={(projectFundingItemValues, helper) => {
                      if (currentProjectFundingFormArrayItem.index < values.funding_agencies.length) {
                        // Update an existing item
                        arrayHelpers.replace(currentProjectFundingFormArrayItem.index, projectFundingItemValues);
                      } else {
                        // Add a new item
                        arrayHelpers.push(projectFundingItemValues);
                      }
                      // Reset the modal form
                      helper.resetForm();
                      // Close the modal
                      setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    initialValues={currentProjectFundingFormArrayItem.values}
                    funding_sources={props.funding_sources}
                    investment_action_category={props.investment_action_category}
                  />
                  {!values.funding_agencies.length && (
                    <Paper>
                      <Box p={3} display="flex" justifyContent="center" alignContent="middle">
                        <Typography>No Funding Sources</Typography>
                      </Box>
                    </Paper>
                  )}
                  {values.funding_agencies.map((fundingAgency, index) => {
                    return (
                      <Paper key={index}>
                        <Box m={3}>
                          <Grid container item spacing={3} xs={12}>
                            <Grid container item spacing={3} xs={12} justify="space-between">
                              <Grid item>
                                <Typography variant="h3">
                                  {getCodeValueNameByID(props.funding_sources, fundingAgency.agency_id)}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <IconButton
                                  title="Edit Funding Source"
                                  aria-label="Edit Funding Source"
                                  onClick={() => {
                                    setCurrentProjectFundingFormArrayItem({
                                      index: index,
                                      values: values.funding_agencies[index]
                                    });
                                    setIsModalOpen(true);
                                  }}>
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  title="Delete Funding Source"
                                  aria-label="Delete Funding Source"
                                  onClick={() => arrayHelpers.remove(index)}>
                                  <Delete />
                                </IconButton>
                              </Grid>
                            </Grid>
                            <Grid item sm={6} md={4}>
                              <Grid container item spacing={2} direction="row">
                                <Grid item xs={12}>
                                  <Box mr={3} display="inline">
                                    Funding Amount
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box mr={3} display="inline">
                                    Start Date / End Date
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box mr={3} display="inline">
                                    Agency Project ID
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box mr={3} display="inline">
                                    Investment Action/Category
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item sm={6} md={8}>
                              <Grid container item spacing={2} direction="row">
                                <Grid item xs={12}>
                                  {fundingAgency.funding_amount}
                                </Grid>
                                <Grid item xs={12}>
                                  {fundingAgency.start_date}
                                  {fundingAgency.end_date && ` / ${fundingAgency.end_date}`}
                                </Grid>
                                <Grid item xs={12}>
                                  {fundingAgency.agency_project_id}
                                </Grid>
                                <Grid item xs={12}>
                                  {fundingAgency.investment_action_category}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'indigenous_partnerships'}
            label={'Indigenous Partnerships'}
            options={props.first_nations}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'stakeholder_partnerships'}
            label={'Stakeholder Partnerships'}
            options={props.stakeholder_partnerships}
            required={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectFundingForm;

export const getCodeValueNameByID = (codeSet: IMultiAutocompleteFieldOption[], codeValueId: number): string => {
  if (!codeSet?.length || !codeValueId) {
    return '';
  }

  return codeSet.find((item) => item.value === codeValueId)?.label || '';
};
