import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { DATE_FORMAT } from 'constants/dateFormats';
import { AddFundingI18N, DeleteFundingI18N, EditFundingI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from 'features/projects/components/ProjectFundingItemForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { Fragment, useContext, useState } from 'react';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';

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

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditFundingI18N.editErrorTitle,
    dialogText: EditFundingI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteFundingI18N.deleteTitle,
    dialogText: DeleteFundingI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => handleDeleteDialogYes()
  };

  const showYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
    dialogContext.setYesNoDialog({ ...defaultYesNoDialogProps, ...yesNoDialogProps });
  };

  const [fundingFormData, setFundingFormData] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDialogEditOpen = async (itemIndex: number) => {
    let fundingSourceValues: IProjectFundingFormArrayItem;

    if (itemIndex < funding.fundingSources.length) {
      // edit an existing funding source
      const fundingSource = funding.fundingSources[itemIndex];

      fundingSourceValues = {
        id: fundingSource.id,
        agency_id: fundingSource.agency_id,
        investment_action_category: fundingSource.investment_action_category,
        investment_action_category_name: fundingSource.investment_action_category_name,
        agency_project_id: fundingSource.agency_project_id,
        funding_amount: fundingSource.funding_amount,
        start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.start_date),
        end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.end_date),
        revision_count: fundingSource.revision_count
      };
    } else {
      // add a new funding source
      fundingSourceValues = ProjectFundingFormArrayItemInitialValues;
    }

    setFundingFormData({ index: itemIndex, values: fundingSourceValues });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectFundingFormArrayItem) => {
    const projectData = {
      funding: {
        fundingSources: [{ ...values }]
      }
    };

    const isEditing = fundingFormData.index < funding.fundingSources.length;
    const errorTitle = isEditing ? EditFundingI18N.editErrorTitle : AddFundingI18N.addErrorTitle;

    try {
      if (isEditing) {
        await biohubApi.project.updateProject(id, projectData);
      } else {
        await biohubApi.project.addFundingSource(id, projectData.funding.fundingSources[0]);
      }

      setOpenEditDialog(false);

      props.refresh();
    } catch (error) {
      const apiError = error as APIError;

      showErrorDialog({ dialogTitle: errorTitle, dialogText: apiError.message, open: true });
    }
  };

  const handleDeleteDialogOpen = async (itemIndex: number) => {
    setFundingFormData({
      index: itemIndex,
      values: funding.fundingSources[fundingFormData.index]
    });
    showYesNoDialog({ open: true });
  };

  const handleDeleteDialogYes = async () => {
    const fundingSource = funding.fundingSources[fundingFormData.index];

    try {
      await biohubApi.project.deleteFundingSource(id, fundingSource.id);
      showYesNoDialog({ open: false });
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogTitle: DeleteFundingI18N.deleteErrorTitle, dialogText: apiError.message, open: true });
      return;
    }

    props.refresh();
  };

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={
          fundingFormData.index < funding.fundingSources.length ? EditFundingI18N.editTitle : AddFundingI18N.addTitle
        }
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
          initialValues: fundingFormData.values,
          validationSchema: ProjectFundingFormArrayItemYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />

      <Box component="header" display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h3">Funding Sources</Typography>
        <Button
          variant="outlined"
          color="primary"
          title="Add Funding Source"
          aria-label="Add Funding Source"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => handleDialogEditOpen(funding.fundingSources.length)}>
          Add Funding Source
        </Button>
      </Box>

      {hasFundingSources &&
        funding.fundingSources.map((item: any, index: number) => (
          <Fragment key={item.id}>
            <Box mt={3}>
              <Divider />
              <Box display="flex" alignItems="center" justifyContent="space-between" my={2} height="2.25rem">
                <Typography variant="h4">{item.agency_name}</Typography>
                <Box>
                  <Button
                    variant="text"
                    color="primary"
                    className="sectionHeaderButton"
                    onClick={() => handleDialogEditOpen(index)}
                    title="Edit Funding Source"
                    aria-label="Edit Funding Source"
                    startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
                    Edit
                  </Button>
                  <Button
                    variant="text"
                    color="primary"
                    className="sectionHeaderButton"
                    data-testid="delete-funding-source"
                    onClick={() => handleDeleteDialogOpen(index)}
                    title="Remove Funding Source"
                    aria-label="Remove Funding Source"
                    startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}>
                    Remove
                  </Button>
                </Box>
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
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortDateFormatMonthFirst,
                        item.start_date,
                        item.end_date
                      )}
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
