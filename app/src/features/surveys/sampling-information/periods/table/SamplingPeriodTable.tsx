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
import { DeleteTechniqueI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IFindSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatTimeDifference } from 'utils/datetime';
import { getCodesName } from 'utils/Utils';

export interface ISamplingSitePeriodRowData {
  survey_sample_period_id: number;
  sample_site: string;
  sample_method: string;
  method_response_metric_id: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface ISamplingPeriodTableProps {
  periods: IFindSamplePeriodRecord[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  pageSizeOptions: number[];
  rowCount: number;
  // Used for when rows can be selected, which is only the case on the Manage Sampling Information page (not the Survey page)
  selectedRows?: GridRowSelectionModel;
  setSelectedRows?: (selection: GridRowSelectionModel) => void;
  pageSizeOptions: number[];
  onDelete?: (techniqueId: number) => Promise<void>;
}

/**
 * Renders a table of sampling periods.
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

  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  const { surveyId, projectId } = useSurveyContext();

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
   * Display the delete technique dialog.
   *
   */
  const deletePeriodDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeleteTechniqueI18N.deleteTitle,
      dialogText: DeleteTechniqueI18N.deleteText,
      yesButtonLabel: DeleteTechniqueI18N.yesButtonLabel,
      noButtonLabel: DeleteTechniqueI18N.noButtonLabel,
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

  const columns: GridColDef<IFindSamplePeriodRecord>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
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
      field: 'sample_site',
      headerName: 'Site',
      flex: 1,
      valueGetter: (params) => {
        return params.row.sample_site.name;
      }
    },
    {
      field: 'sample_method',
      headerName: 'Technique',
      flex: 1,
      valueGetter: (params) => {
        return params.row.method_technique.name;
      }
    },
    {
      field: 'method_response_metric_id',
      headerName: 'Response Metric',
      flex: 1,
      valueGetter: (params) => {
        const value = getCodesName(
          codesContext.codesDataLoader.data,
          'method_response_metrics',
          params.row.sample_method.method_response_metric_id
        );

        return value;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.start_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
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
        <Typography variant="body2">{dayjs(params.row.end_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
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
          <RouterLink
            to={`/admin/projects/${projectId}/surveys/${surveyId}/sampling/techniques/${actionMenuAnchorEl?.periodId}/edit`}>
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
          getRowId={(row: ISamplingSitePeriodRowData) => row.survey_sample_period_id}
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
