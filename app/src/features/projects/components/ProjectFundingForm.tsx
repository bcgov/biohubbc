import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AddFundingI18N } from 'constants/i18n';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from './ProjectFundingItemForm';

export interface IProjectFundingForm {
  funding_sources: IProjectFundingFormArrayItem[];
}

export const ProjectFundingFormInitialValues: IProjectFundingForm = {
  funding_sources: []
};

export const ProjectFundingFormYupSchema = yup.object().shape({});

export interface IInvestmentActionCategoryOption extends IMultiAutocompleteFieldOption {
  fs_id: number;
}

export interface IProjectFundingFormProps {
  funding_sources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategoryOption[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    flexGrow: 1,
    marginRight: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 700
  },
  titleDesc: {
    marginLeft: theme.spacing(1),
    fontWeight: 400
  },
  fundingListIem: {
    padding: 0,
    '& + li': {
      marginTop: theme.spacing(2)
    }
  },
  fundingListItemInner: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden'
  },
  fundingListItemToolbar: {
    paddingRight: theme.spacing(2)
  }
}));

/**
 * Create project - Funding section
 *
 * @return {*}
 */
const ProjectFundingForm: React.FC<IProjectFundingFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<IProjectFundingForm>();
  const { values } = formikProps;

  //Tracks information about the current funding source item that is being added/edited
  const [currentProjectFundingFormArrayItem, setCurrentProjectFundingFormArrayItem] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <Box>
        <Box component="header" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h3">Funding Sources ({values.funding_sources.length})</Typography>
          <Button
            data-testid="add-button"
            variant="outlined"
            color="primary"
            title="Add Funding Source"
            aria-label="Add Funding Source"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => {
              setCurrentProjectFundingFormArrayItem({
                index: values.funding_sources.length,
                values: ProjectFundingFormArrayItemInitialValues
              });
              setIsModalOpen(true);
            }}>
            Add Funding Source
          </Button>
        </Box>
        <Box>
          <FieldArray
            name="funding_sources"
            render={(arrayHelpers) => (
              <Box mb={2}>
                <EditDialog
                  dialogTitle={AddFundingI18N.addTitle}
                  open={isModalOpen}
                  component={{
                    element: (
                      <ProjectFundingItemForm
                        funding_sources={props.funding_sources}
                        investment_action_category={props.investment_action_category}
                      />
                    ),
                    initialValues: currentProjectFundingFormArrayItem.values,
                    validationSchema: ProjectFundingFormArrayItemYupSchema
                  }}
                  onCancel={() => setIsModalOpen(false)}
                  onSave={(projectFundingItemValues) => {
                    if (currentProjectFundingFormArrayItem.index < values.funding_sources.length) {
                      // Update an existing item
                      arrayHelpers.replace(currentProjectFundingFormArrayItem.index, projectFundingItemValues);
                    } else {
                      // Add a new item
                      arrayHelpers.push(projectFundingItemValues);
                    }

                    // Close the modal
                    setIsModalOpen(false);
                  }}
                />
                <List dense disablePadding>
                  {!values.funding_sources.length && (
                    <ListItem dense component={Paper}>
                      <Box display="flex" flexGrow={1} justifyContent="center" alignContent="middle" p={2}>
                        <Typography variant="subtitle2">No Funding Sources</Typography>
                      </Box>
                    </ListItem>
                  )}
                  {values.funding_sources.map((fundingSource, index) => {
                    const investment_action_category_label =
                      (fundingSource.agency_id === 1 && 'Investment Action') ||
                      (fundingSource.agency_id === 2 && 'Investment Category') ||
                      null;

                    const investment_action_category_value = props.investment_action_category.filter(
                      (item) => item.value === fundingSource.investment_action_category
                    )?.[0]?.label;

                    return (
                      <ListItem dense className={classes.fundingListIem} key={index}>
                        <Paper className={classes.fundingListItemInner}>
                          <Toolbar className={classes.fundingListItemToolbar}>
                            <Typography className={classes.title}>
                              {getCodeValueNameByID(props.funding_sources, fundingSource.agency_id)}
                              {investment_action_category_label && (
                                <span className={classes.titleDesc}>({investment_action_category_value})</span>
                              )}
                            </Typography>

                            <IconButton
                              color="primary"
                              data-testid={'edit-button-' + index}
                              title="Edit Funding Source"
                              aria-label="Edit Funding Source"
                              onClick={() => {
                                setCurrentProjectFundingFormArrayItem({
                                  index: index,
                                  values: values.funding_sources[index]
                                });
                                setIsModalOpen(true);
                              }}>
                              <Icon path={mdiPencilOutline} size={1} />
                            </IconButton>
                            <IconButton
                              color="primary"
                              data-testid={'delete-button-' + index}
                              title="Remove Funding Source"
                              aria-label="Remove Funding Source"
                              onClick={() => arrayHelpers.remove(index)}>
                              <Icon path={mdiTrashCanOutline} size={1} />
                            </IconButton>
                          </Toolbar>
                          <Divider />
                          <Box py={2} px={3}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="textSecondary">
                                  Agency Project ID
                                </Typography>
                                <Typography variant="body1">{fundingSource.agency_project_id}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="textSecondary">
                                  Funding Amount
                                </Typography>
                                <Typography variant="body1">
                                  {getFormattedAmount(fundingSource.funding_amount)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="textSecondary">
                                  Start / End Date
                                </Typography>
                                <Typography variant="body1">
                                  {getFormattedDateRangeString(
                                    DATE_FORMAT.ShortMediumDateFormat,
                                    fundingSource.start_date,
                                    fundingSource.end_date
                                  )}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Paper>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          />
        </Box>
      </Box>
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
