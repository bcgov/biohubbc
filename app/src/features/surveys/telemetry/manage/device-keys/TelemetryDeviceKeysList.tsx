import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { TelemetryDeviceKeyFileI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDeviceKeyFile } from 'interfaces/useTelemetryApi.interface';
import { getFormattedDate } from 'utils/Utils';

export interface ITelemetryDeviceKeysListProps {
  isLoading?: boolean;
  telementryCredentialAttachments: TelemetryDeviceKeyFile[];
}

export const TelemetryDeviceKeysList = (props: ITelemetryDeviceKeysListProps) => {
  const { isLoading, telementryCredentialAttachments } = props;

  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const handleDownload = async (attachment: TelemetryDeviceKeyFile) => {
    try {
      const response = await biohubApi.survey.getSurveyAttachmentSignedURL(
        surveyContext.projectId,
        surveyContext.surveyId,
        attachment.survey_telemetry_credential_attachment_id,
        attachment.file_type
      );

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      const apiError = error as APIError;
      // Show error dialog
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: TelemetryDeviceKeyFileI18N.downloadErrorTitle,
        dialogText: TelemetryDeviceKeyFileI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false })
      });
    }
  };

  const rows = telementryCredentialAttachments;

  // Define the columns for the DataGrid
  const columns: GridColDef<TelemetryDeviceKeyFile>[] = [
    {
      field: 'survey_telemetry_credential_attachment_id',
      headerName: 'ID',
      width: 70,
      minWidth: 70,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_telemetry_credential_attachment_id}
        </Typography>
      )
    },
    {
      field: 'file_name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Stack
            flexDirection="row"
            alignItems="center"
            gap={2}
            sx={{
              '& svg': {
                color: '#1a5a96'
              },
              '& a': {
                fontWeight: 700
              }
            }}>
            <Link underline="always" onClick={() => handleDownload(params.row)} tabIndex={0}>
              {params.value}
            </Link>
          </Stack>
        );
      }
    },
    {
      field: 'last_modified',
      headerName: 'Last Modified',
      flex: 1,
      disableColumnMenu: true,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={700}>
          Last Modified
        </Typography>
      ),
      renderCell: (params) => (
        <Typography variant="body2">
          {getFormattedDate(DATE_FORMAT.ShortMediumDateTimeFormat, params.row.update_date ?? params.row.create_date)}
        </Typography>
      )
    }
  ];

  return (
    <LoadingGuard
      isLoading={isLoading}
      isLoadingFallback={<SkeletonList />}
      isLoadingFallbackDelay={100}
      hasNoData={false}
      hasNoDataFallback={
        <NoDataOverlay title="Device Keys" subtitle="No telemetry device key files found" icon={mdiArrowTopRight} />
      }
      hasNoDataFallbackDelay={100}>
      <Box>
        <StyledDataGrid
          noRowsMessage={'No telemetry device keys found'}
          autoHeight
          rows={rows}
          getRowId={(row) => row.survey_telemetry_credential_attachment_id}
          columns={columns}
          pageSizeOptions={[5]}
          rowSelection={false}
          checkboxSelection={false}
          hideFooter
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          sortingOrder={['asc', 'desc']}
          data-testid="funding-source-table"
        />
      </Box>
    </LoadingGuard>
  );
};
