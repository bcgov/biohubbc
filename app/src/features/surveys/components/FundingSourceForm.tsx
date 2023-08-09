import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
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
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AddFundingI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';
import yup from 'utils/YupSchema';
import FundingSourceItemForm, {
  IFundingSourceAutocompleteField,
  IFundingSourceFormArrayItem,
  FundingSourceFormArrayItemInitialValues,
  FundingSourceFormArrayItemYupSchema
} from './FundingSourceItemForm';

export interface IFundingSourceForm {
  funding: {
    fundingSources: IFundingSourceFormArrayItem[];
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

export interface IFundingSourceFormProps {
  funding_sources: IFundingSourceAutocompleteField[];
  investment_action_category: IInvestmentActionCategoryOption[];
  first_nations: IFundingSourceAutocompleteField[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 0,
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
  fundingSourceItem: {
    marginTop: theme.spacing(2),
    borderColor: grey[400],
    '& .MuiCardHeader-action': {
      margin: '-8px 0'
    },
    '& .MuiCardContent-root:last-child': {
      paddingBottom: theme.spacing(2)
    }
  }
}));

/**
 * Create project - Funding section
 *
 * @return {*}
 */
const FundingSourceForm: React.FC<IFundingSourceFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<ICreateProjectRequest>();
  const { values, handleSubmit } = formikProps;

  //Tracks information about the current funding source item that is being added/edited
  const [currentFundingSourceFormArrayItem, setCurrentFundingSourceFormArrayItem] = useState({
    index: 0,
    values: FundingSourceFormArrayItemInitialValues
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <Box>
        <Button
          data-testid="funding-form-add-button"
          variant="outlined"
          color="primary"
          title="Add Funding Source"
          aria-label="Add Funding Source"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => {
            setCurrentFundingSourceFormArrayItem({
              index: values.funding.fundingSources.length,
              values: FundingSourceFormArrayItemInitialValues
            });
            setIsModalOpen(true);
          }}>
          Add Funding Source
        </Button>
        <Box>
          <FieldArray
            name="funding.fundingSources"
            render={(arrayHelpers: FieldArrayRenderProps) => (
              <Box>
                <EditDialog
                  dialogTitle={AddFundingI18N.addTitle}
                  open={isModalOpen}
                  component={{
                    element: (
                      <FundingSourceItemForm
                        sources={[...props.funding_sources, ...props.first_nations]}
                        investment_action_category={props.investment_action_category}
                      />
                    ),
                    initialValues: currentFundingSourceFormArrayItem.values,
                    validationSchema: FundingSourceFormArrayItemYupSchema
                  }}
                  onCancel={() => setIsModalOpen(false)}
                  onSave={(projectFundingItemValues) => {
                    if (currentFundingSourceFormArrayItem.index < values.funding.fundingSources.length) {
                      // Update an existing item
                      arrayHelpers.replace(currentFundingSourceFormArrayItem.index, projectFundingItemValues);
                    } else {
                      // Add a new item
                      arrayHelpers.push(projectFundingItemValues);
                    }

                    // Close the modal
                    setIsModalOpen(false);
                  }}
                />
                <Box>
                  {values.funding.fundingSources.map((fundingSource, index) => {
                    const investment_action_category_label =
                      (fundingSource.agency_id === 1 && 'Investment Action') ||
                      (fundingSource.agency_id === 2 && 'Investment Category') ||
                      null;
                    const investment_action_category_value = props.investment_action_category.filter(
                      (item) => item.value === fundingSource.investment_action_category
                    )?.[0]?.label;
                    const key = [
                      getCodeValueNameByID(props.first_nations, fundingSource.first_nations_id) ||
                        getCodeValueNameByID(props.funding_sources, fundingSource.agency_id),
                      index
                    ].join('-');
                    return (
                      <Card key={key} variant="outlined" className={classes.fundingSourceItem}>
                        <CardHeader
                          title={
                            <Typography className={classes.title}>
                              {getCodeValueNameByID(props.funding_sources, fundingSource?.agency_id) ||
                                getCodeValueNameByID(props.first_nations, fundingSource?.first_nations_id)}
                              {investment_action_category_label && (
                                <span className={classes.titleDesc}>({investment_action_category_value})</span>
                              )}
                            </Typography>
                          }
                          action={
                            <Box>
                              <IconButton
                                data-testid={'funding-form-edit-button-' + index}
                                title="Edit Funding Source"
                                aria-label="Edit Funding Source"
                                onClick={() => {
                                  setCurrentFundingSourceFormArrayItem({
                                    index: index,
                                    values: values.funding.fundingSources[index]
                                  });
                                  setIsModalOpen(true);
                                }}>
                                <Icon path={mdiPencilOutline} size={1} />
                              </IconButton>
                              <IconButton
                                data-testid={'funding-form-delete-button-' + index}
                                title="Remove Funding Source"
                                aria-label="Remove Funding Source"
                                onClick={() => arrayHelpers.remove(index)}>
                                <Icon path={mdiTrashCanOutline} size={1} />
                              </IconButton>
                            </Box>
                          }></CardHeader>

                        {(fundingSource.agency_project_id ||
                          fundingSource.funding_amount ||
                          (fundingSource.start_date && fundingSource.end_date)) && (
                          <>
                            <Divider></Divider>
                            <CardContent>
                              <Grid container spacing={2}>
                                {fundingSource.agency_project_id && (
                                  <>
                                    <Grid item xs={12} sm={6} md={4}>
                                      <Typography variant="body2" color="textSecondary">
                                        Agency Project ID
                                      </Typography>
                                      <Typography variant="body1">{fundingSource.agency_project_id}</Typography>
                                    </Grid>
                                  </>
                                )}
                                {fundingSource.funding_amount && (
                                  <>
                                    <Grid item xs={12} sm={6} md={4}>
                                      <Typography variant="body2" color="textSecondary">
                                        Funding Amount
                                      </Typography>
                                      <Typography variant="body1">
                                        {getFormattedAmount(fundingSource.funding_amount)}
                                      </Typography>
                                    </Grid>
                                  </>
                                )}
                                {fundingSource.start_date && fundingSource.end_date && (
                                  <>
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
                                  </>
                                )}
                              </Grid>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          />
        </Box>
      </Box>
    </form>
  );
};

export default FundingSourceForm;

export const getCodeValueNameByID = (codeSet: IMultiAutocompleteFieldOption[], codeValueId?: number): string => {
  if (!codeSet?.length || !codeValueId) {
    return '';
  }
  return codeSet.find((item) => item.value === codeValueId)?.label ?? '';
};
