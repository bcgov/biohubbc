import { mdiArrowTopRight, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SamplePeriodI18N } from 'constants/i18n';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatTimeDifference } from 'utils/datetime';
import { getFormattedDate } from 'utils/Utils';

interface ISamplingPeriodTableProps {
  periods: GetSamplingPeriod[];
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  pageSizeOptions: number[];
  rowCount: number;
  // Used for when rows can be selected, which is only the case on the Manage Sampling Information page (not the Survey page)
  selectedRows?: GridRowSelectionModel;
  setSelectedRows?: (selection: GridRowSelectionModel) => void;
  onDelete?: (techniqueId: number) => Promise<void>;
}

/**
 * Renders a table of survey sampling periods, for the Manage Sampling Information page.
 *
 * @param {ISamplingPeriodTableProps} props
 * @returns {*}
 */
export const SamplingPeriodTable = (props: ISamplingPeriodTableProps) => {
  const {
    periods,
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    rowCount,
    selectedRows,
    pageSizeOptions,
    setSelectedRows,
    onDelete
  } = props;

  // Individual row action menu
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<{
    anchorEl: MenuProps['anchorEl'];
    periodId: number;
  } | null>(null);

  const dialogContext = useDialogContext();
  const { surveyId } = useSurveyContext();

  /**
   * Handle the delete technique API call.
   *
   */
  const handleDeletePeriod = async () => {
    if (!actionMenuAnchorEl || !onDelete) {
      return;
    }

    await onDelete(actionMenuAnchorEl.periodId)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Period</strong>
              </Typography>
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete period dialog.
   *
   */
  const deletePeriodDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: SamplePeriodI18N.deleteSamplePeriodTitle,
      dialogText: SamplePeriodI18N.deleteSamplePeriodText,
      yesButtonLabel: SamplePeriodI18N.deleteSamplePeriodYesButtonLabel,
      noButtonLabel: SamplePeriodI18N.deleteSamplePeriodNoButtonLabel,
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleDeletePeriod();
      }
    });
  };

  const columns: GridColDef<GetSamplingPeriod>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_sample_period_id}
        </Typography>
      )
    },
    {
      field: 'survey_sample_site_name',
      headerName: 'Site',
      flex: 1,
      sortable: false, // TODO not yet supported by the API
      valueGetter: (params) => {
        return params.row.survey_sample_site?.name;
      }
    },
    {
      field: 'method_technique_name',
      headerName: 'Technique',
      flex: 1,
      sortable: false, // TODO not yet supported by the API
      valueGetter: (params) => {
        return params.row.method_technique?.name;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.start_date)}</Typography>
      )
    },
    {
      field: 'start_time',
      headerName: 'Start time',
      flex: 1
    },
    {
      field: 'end_date',
      headerName: 'End date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.end_date)}</Typography>
      )
    },
    {
      field: 'end_time',
      headerName: 'End time',
      flex: 1
    },
    {
      field: 'duration',
      headerName: 'Duration',
      flex: 1,
      valueGetter: (params) => {
        const { start_date, start_time, end_date, end_time } = params.row;

        if (!start_date || !end_date) {
          return null;
        }

        return formatTimeDifference(start_date, start_time, end_date, end_time);
      }
    }
  ];

  // If rows can be selected, include the action button for editing and deleting
  if (setSelectedRows) {
    columns.push({
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => {
        return (
          <IconButton
            onClick={(event) => {
              setActionMenuAnchorEl({
                anchorEl: event.currentTarget,
                periodId: params.row.survey_sample_period_id
              });
            }}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        );
      }
    });
  }

  return (
    <>
      <Menu
        sx={{ pb: 2 }}
        open={Boolean(actionMenuAnchorEl)}
        onClose={() => setActionMenuAnchorEl(null)}
        anchorEl={actionMenuAnchorEl?.anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem
          sx={{
            p: 0,
            '& a': {
              display: 'flex',
              px: 2,
              py: '6px',
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 0,
              '&:focus': {
                outline: 'none'
              }
            }
          }}>
          <RouterLink to={`/admin/surveys/${surveyId}/sampling/period/${actionMenuAnchorEl?.periodId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setActionMenuAnchorEl(null);
            deletePeriodDialog();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <LoadingGuard
        hasNoData={!periods.length}
        hasNoDataFallback={
          <NoDataOverlay
            height="200px"
            title="Add Periods"
            subtitle="Techniques describe how you collected species observations"
            icon={mdiArrowTopRight}
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          disableColumnMenu
          autoHeight={false}
          getRowHeight={() => 'auto'}
          rows={periods}
          getRowId={(row: GetSamplingPeriod) => row.survey_sample_period_id}
          columns={columns}
          checkboxSelection={true}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          disableRowSelectionOnClick
          rowCount={rowCount}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={pageSizeOptions}
          initialState={{
            pagination: {
              paginationModel
            }
          }}
        />
      </LoadingGuard>
    </>
  );
};
