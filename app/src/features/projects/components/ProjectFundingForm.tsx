import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AddFundingI18N } from 'constants/i18n';
import { FieldArray, useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from './ProjectFundingItemForm';

export interface IProjectFundingForm {
  funding: {
    funding_sources: IProjectFundingFormArrayItem[];
  };
}

export const ProjectFundingFormInitialValues: IProjectFundingForm = {
  funding: {
    funding_sources: []
  }
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
  fundingListItem: {
    flexDirection: 'column',
    alignItems: 'normal',
    padding: 0,
    marginTop: theme.spacing(2),
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: grey[400],
    borderRadius: '4px'
  },
  fundingListItemToolbar: {
    minHeight: '60px',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: grey[100],
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px'
  }
}));

/**
 * Create project - Funding section
 *
 * @return {*}
 */
const ProjectFundingForm: React.FC<IProjectFundingFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<ICreateProjectRequest>();
  const { values, handleSubmit } = formikProps;

  //Tracks information about the current funding source item that is being added/edited
  const [currentProjectFundingFormArrayItem, setCurrentProjectFundingFormArrayItem] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <Box>
        <Button
          data-testid="add-button"
          variant="outlined"
          color="primary"
          title="Add Funding Source"
          aria-label="Add Funding Source"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => {
            setCurrentProjectFundingFormArrayItem({
              index: values.funding.funding_sources.length,
              values: ProjectFundingFormArrayItemInitialValues
            });
            setIsModalOpen(true);
          }}>
          Add Funding Source
        </Button>
        <Box>
          <FieldArray
            name="funding.funding_sources"
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
                    if (currentProjectFundingFormArrayItem.index < values.funding.funding_sources.length) {
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
                  {values.funding.funding_sources.map((fundingSource, index) => {
                    const investment_action_category_label =
                      (fundingSource.agency_id === 1 && 'Investment Action') ||
                      (fundingSource.agency_id === 2 && 'Investment Category') ||
                      null;

                    const investment_action_category_value = props.investment_action_category.filter(
                      (item) => item.value === fundingSource.investment_action_category
                    )?.[0]?.label;

                    return (
                      <ListItem className={classes.fundingListItem} key={index}>
                        <Toolbar disableGutters className={classes.fundingListItemToolbar}>
                          <Typography className={classes.title}>
                            {getCodeValueNameByID(props.funding_sources, fundingSource.agency_id)}
                            {investment_action_category_label && (
                              <span className={classes.titleDesc}>({investment_action_category_value})</span>
                            )}
                          </Typography>
                          <IconButton
                            data-testid={'edit-button-' + index}
                            title="Edit Funding Source"
                            aria-label="Edit Funding Source"
                            onClick={() => {
                              setCurrentProjectFundingFormArrayItem({
                                index: index,
                                values: values.funding.funding_sources[index]
                              });
                              setIsModalOpen(true);
                            }}>
                            <Icon path={mdiPencilOutline} size={1} />
                          </IconButton>
                          <IconButton
                            data-testid={'delete-button-' + index}
                            title="Remove Funding Source"
                            aria-label="Remove Funding Source"
                            onClick={() => arrayHelpers.remove(index)}>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </Toolbar>
                        <Box p={2}>
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
