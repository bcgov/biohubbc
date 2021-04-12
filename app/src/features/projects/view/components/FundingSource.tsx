import { Box, Grid, Button, Divider, Typography } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDateRangeString, getFormattedAmount, getFormattedDate } from 'utils/Utils';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditFundingI18N } from 'constants/i18n';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from 'features/projects/components/ProjectFundingItemForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';

export interface IProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectFundingProps> = (props) => {
  const {
    projectForViewData: { funding, id },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditFundingI18N.editErrorTitle,
    dialogText: EditFundingI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const [fundingFormData, setFundingFormData] = useState<IProjectFundingFormArrayItem>(
    ProjectFundingFormArrayItemInitialValues
  );

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEditOpen = async (itemIndex: number) => {
    const fundingSource = funding.fundingSources[itemIndex];

    setFundingFormData({
      id: fundingSource.id,
      agency_id: fundingSource.agency_id,
      investment_action_category: fundingSource.investment_action_category,
      investment_action_category_name: fundingSource.investment_action_category_name,
      agency_project_id: fundingSource.agency_project_id,
      funding_amount: fundingSource.funding_amount,
      start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.start_date),
      end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.end_date),
      revision_count: fundingSource.revision_count
    });

    setOpenEditDialog(true);
  };
  const handleDialogEditSave = async (values: IProjectFundingFormArrayItem) => {
    const projectData = {
      funding: {
        fundingSources: [{ ...values }]
      }
    };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditFundingI18N.editTitle}
        open={openEditDialog}
        component={{
          element: (
            <ProjectFundingItemForm
              funding_sources={
                codes?.funding_source?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              investment_action_category={
                codes?.investment_action_category?.map((item) => {
                  return { value: item.id, fs_id: item.fs_id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: fundingFormData,
          validationSchema: ProjectFundingFormArrayItemYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h3">Funding Sources</Typography>
        <Button variant="outlined" color="primary">
          Add Funding Source
        </Button>
      </Box>

      {funding.fundingSources.map((item: any, index: number) => (
        <Fragment key={item.id}>
          <Box mt={3}>
            <Divider />
            <Box display="flex" alignItems="center" justifyContent="space-between" my={2} height="2rem">
              <Typography variant="h4">{item.agency_name}</Typography>
              <Button
                className="editButtonSmall"
                onClick={() => handleDialogEditOpen(index)}
                title="Edit Funding Source Information"
                aria-label="Edit Funding Source Information"
                startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
                EDIT
              </Button>
            </Box>
            <dl>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Agency Project ID
                  </Typography>
                  <Typography component="dd" variant="body1">
                    {item.agency_project_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Funding Amount
                  </Typography>
                  <Typography component="dd" variant="body1">
                    {getFormattedAmount(item.funding_amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Funding Dates
                  </Typography>
                  <Typography component="dd" variant="body1">
                    {getFormattedDateRangeString(DATE_FORMAT.ShortDateFormatMonthFirst, item.start_date, item.end_date)}
                  </Typography>
                </Grid>
                {item.investment_action_category_name !== 'Not Applicable' && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Investment Category
                    </Typography>
                    <Typography component="dd" variant="body1">
                      {item.investment_action_category_name}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </dl>
          </Box>
        </Fragment>
      ))}

      {!hasFundingSources && (
        <Box mt={2}>
          <Typography component="dd" variant="body1">
            No Funding Sources
          </Typography>
        </Box>
      )}
    </>
  );
};

export default FundingSource;
