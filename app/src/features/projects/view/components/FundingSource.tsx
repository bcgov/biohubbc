import { Box, Grid, Button, Typography, Divider } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDateRangeString, getFormattedAmount, getFormattedDate } from 'utils/Utils';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditFundingI18N, DeleteFundingI18N, AddFundingI18N } from 'constants/i18n';
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
import { mdiPlus, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import YesNoDialog from 'components/dialog/YesNoDialog';

const useStyles = makeStyles({
  heading: {
    fontWeight: 'bold'
  },
  addButton: {
    border: '2px solid'
  },
  topBorder: {
    color: '#adb5bd',
    width: '100%'
  }
});

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

  const classes = useStyles();
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

  const [fundingFormData, setFundingFormData] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDialogEditOpen = async (itemIndex: number) => {
    const fundingSource = funding.fundingSources[itemIndex];

    if (itemIndex < funding.fundingSources.length) {
      setFundingFormData({
        index: itemIndex,
        values: {
          id: fundingSource.id,
          agency_id: fundingSource.agency_id,
          investment_action_category: fundingSource.investment_action_category,
          investment_action_category_name: fundingSource.investment_action_category_name,
          agency_project_id: fundingSource.agency_project_id,
          funding_amount: fundingSource.funding_amount,
          start_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.start_date),
          end_date: getFormattedDate(DATE_FORMAT.ShortDateFormat, fundingSource.end_date),
          revision_count: fundingSource.revision_count
        }
      });
    } else {
      setFundingFormData({ index: itemIndex, values: ProjectFundingFormArrayItemInitialValues });
    }

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectFundingFormArrayItem) => {
    const projectData = {
      funding: {
        fundingSources: [{ ...values}]
      }
    };

    if (fundingFormData.index < funding.fundingSources.length) {
      // update an existing funding source

      try {
        await biohubApi.project.updateProject(id, projectData);
      } catch (error) {
        const apiError = error as APIError;
        showErrorDialog({ dialogTitle: EditFundingI18N.editErrorTitle, dialogText: apiError.message, open: true });
        return;
      } finally {
        setOpenEditDialog(false);
      }

      props.refresh();
    } else {
      // add a new funding source

      try {
        await biohubApi.project.addFundingSource(id, projectData.funding.fundingSources[0]);
      } catch (error) {
        const apiError = error as APIError;
        showErrorDialog({ dialogTitle: AddFundingI18N.addErrorTitle, dialogText: apiError.message, open: true });
        return;
      } finally {
        setOpenEditDialog(false);
      }

      props.refresh();
    }
  };


  const handleDeleteDialogOpen = async (itemIndex: number) => {
    setFundingFormData({
      index: itemIndex,
      values: funding.fundingSources[fundingFormData.index]
    })
    setOpenDeleteDialog(true);
  }

  const handleDeleteDialogClose = async () => {
    setOpenDeleteDialog(false);
  }

  const handleDeleteDialogYes = async () => {
    const fundingSource = funding.fundingSources[fundingFormData.index];

    try {
      await biohubApi.project.deleteFundingSource(id, fundingSource.id + 100);
      setOpenDeleteDialog(false);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogTitle: DeleteFundingI18N.deleteErrorTitle, dialogText: apiError.message, open: true });
      return;
    }

    props.refresh();
  };

  return (
    <>
      <EditDialog
        dialogTitle={(fundingFormData.index < funding.fundingSources.length ? EditFundingI18N.editTitle : AddFundingI18N.addTitle)}
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
      <YesNoDialog
        dialogTitle={DeleteFundingI18N.deleteTitle}
        dialogText={DeleteFundingI18N.deleteText}
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        onNo={handleDeleteDialogClose}
        onYes={handleDeleteDialogYes}
      />
      <ErrorDialog {...errorDialogProps} />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Funding Sources</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              title="Add Funding Source"
              aria-label="Add Funding Source"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => handleDialogEditOpen(funding.fundingSources.length)}>
              Add Funding Source
            </Button>
          </Grid>
        </Grid>
        {funding.fundingSources.map((item: any, index: number) => (
          <Fragment key={item.id}>
            <Grid container item>
              <Divider className={classes.topBorder} />
            </Grid>
            <Grid container item spacing={0} xs={12} justify="space-between" alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography className={classes.heading}>{item.agency_name}</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Button
                  className="editButtonSmall"
                  onClick={() => handleDialogEditOpen(index)}
                  title="Edit Funding Source Information"
                  aria-label="Edit Funding Source Information"
                  startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
                  EDIT
                </Button>
                <Button
                  className="trashButtonSmall"
                  onClick={() => handleDeleteDialogOpen(index)}
                  title="Delete Funding Source"
                  aria-label="Delete Funding Source"
                  startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}></Button>
              </Grid>
            </Grid>
            <Grid container item spacing={3} xs={12}>
              <Grid item xs={12} sm={6} md={4}>
                <Box color="text.disabled">
                  <Typography variant="caption">Agency Project ID</Typography>
                </Box>
                <Box>
                  <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                    {item.agency_project_id}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box color="text.disabled">
                  <Typography variant="caption">Funding Amount</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">{getFormattedAmount(item.funding_amount)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box color="text.disabled">
                  <Typography variant="caption">Funding Dates</Typography>
                </Box>
                <Box>
                  <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                    {getFormattedDateRangeString(DATE_FORMAT.ShortDateFormatMonthFirst, item.start_date, item.end_date)}
                  </Typography>
                </Box>
              </Grid>
              {item.investment_action_category_name !== 'Not Applicable' && (
                <Grid item xs={12} sm={6} md={4}>
                  <Box color="text.disabled">
                    <Typography variant="caption">Investment Category</Typography>
                  </Box>
                  <Box>
                    <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                      {item.investment_action_category_name}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default FundingSource;
