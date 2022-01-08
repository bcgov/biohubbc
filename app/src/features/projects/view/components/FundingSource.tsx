import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AddFundingI18N, DeleteProjectFundingI18N, EditFundingI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from 'features/projects/components/ProjectFundingItemForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  fundingSourceTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  }
}));

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
  const classes = useStyles();

  const {
    projectForViewData: { funding, id },
    codes
  } = props;

  const restorationTrackerApi = useRestorationTrackerApi();

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
    dialogTitle: DeleteProjectFundingI18N.deleteTitle,
    dialogText: DeleteProjectFundingI18N.deleteText,
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
        await restorationTrackerApi.project.updateProject(id, projectData);
      } else {
        await restorationTrackerApi.project.addFundingSource(id, projectData.funding.fundingSources[0]);
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
      await restorationTrackerApi.project.deleteFundingSource(id, fundingSource.id);
      showYesNoDialog({ open: false });
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({
        dialogTitle: DeleteProjectFundingI18N.deleteErrorTitle,
        dialogText: apiError.message,
        open: true
      });
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

      <H3ButtonToolbar
        label="Funding Sources"
        buttonLabel="Add Funding Source"
        buttonTitle="Add Funding Source"
        buttonStartIcon={<Icon path={mdiPlus} size={0.875} />}
        buttonOnClick={() => handleDialogEditOpen(funding.fundingSources.length)}
        toolbarProps={{ disableGutters: true }}
      />

      <TableContainer>
        <Table padding="default" className={classes.fundingSourceTable}>
          <TableHead>
            <TableRow>
              <TableCell>Agency</TableCell>
              <TableCell width="100px">Project ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell width="130px" align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {hasFundingSources &&
              funding.fundingSources.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.agency_name}
                    {item.investment_action_category_name !== 'Not Applicable' && (
                      <Typography component="em" variant="body2">
                        &nbsp;({item.investment_action_category_name})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {item.agency_project_id || 'No Agency Project ID'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getFormattedAmount(item.funding_amount)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, item.start_date, item.end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDialogEditOpen(index)}
                      title="Edit Funding Source"
                      aria-label="Edit Funding Source"
                      data-testid="edit-funding-source">
                      <Icon path={mdiPencilOutline} size={0.875} />
                    </IconButton>
                    <IconButton
                      data-testid="delete-funding-source"
                      onClick={() => handleDeleteDialogOpen(index)}
                      title="Remove Funding Source"
                      aria-label="Remove Funding Source">
                      <Icon path={mdiTrashCanOutline} size={0.875} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

            {!hasFundingSources && (
              <TableRow>
                <TableCell colSpan={5}>No Funding Sources</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default FundingSource;
