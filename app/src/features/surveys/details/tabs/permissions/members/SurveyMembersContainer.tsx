import { mdiArrowTopRight, mdiEmailPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { CreateButton } from 'components/buttons/CreateButton';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { getSurveyRoleColour } from 'constants/colours';
import { SURVEY_ROLE } from 'constants/roles';
import MembersFilterForm from 'features/collection/details/members/filter/CollectionMembersFilterForm';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { ISurveyMember, ISurveyMembersAdvancedFilters } from 'interfaces/useSurveyApi.interface';
import { useEffect, useState } from 'react';
import { StringValues } from 'types/misc';
import { getCodesName } from 'utils/Utils';
import SurveyMemberDialog from './dialog/SurveyMembersDialog';
import SurveyMembersEmailDialog from './dialog/SurveyMembersEmailDialog';

type SurveyDataTableURLParams = {
  // filter
  sm_keyword?: string;
  sm_itis_tsn?: number;
  sm_system_user_id?: string;
};

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveyMembersContainer = () => {
  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<SurveyDataTableURLParams>>();
  const [participantDialogIsOpen, setParticipantDialogIsOpen] = useState(false);
  const [participantEmailDialogIsOpen, setParticipantEmailDialogIsOpen] = useState(false);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ISurveyMembersAdvancedFilters>({
    keyword: searchParams.get('sm_keyword') ?? undefined,
    system_user_id: searchParams.get('sm_system_user_id') ? Number(searchParams.get('sm_system_user_id')) : undefined
  });

  const surveyMembersDataLoader = useDataLoader((filters?: ISurveyMembersAdvancedFilters) =>
    biohubApi.survey.getSurveyMembers(surveyContext.surveyId, filters)
  );

  useEffect(() => {
    surveyMembersDataLoader.load();
  }, [surveyMembersDataLoader]);

  const columns: GridColDef<ISurveyMember>[] = [
    {
      field: 'survey_member_id',
      headerName: 'ID',
      width: 85,
      minWidth: 85,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_member_id}
        </Typography>
      )
    },
    {
      field: 'display_name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true
    },
    {
      field: 'survey_role_id',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => {
        const role = getCodesName(
          codesContext.codesDataLoader.data,
          'survey_roles',
          params.row.survey_role_id
        ) as SURVEY_ROLE;
        return <ColouredRectangleChip label={role} colour={getSurveyRoleColour(role)} />;
      }
    }
  ];

  const surveyMembers = surveyMembersDataLoader.data?.members ?? [];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Members &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(surveyMembersDataLoader.data?.members.length ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <Box>
            <MembersFilterForm
              initialValues={advancedFiltersModel}
              handleSubmit={(values) => {
                setSearchParams(
                  searchParams
                    .setOrDelete('sm_keyword', values.keyword)
                    .setOrDelete('sm_system_user_id', values.system_user_id)
                );
                setAdvancedFiltersModel(values);
              }}
            />
          </Box>
          <CreateButton
            label="Invite Members"
            onClick={() => {
              setParticipantDialogIsOpen(true);
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setParticipantEmailDialogIsOpen(true);
            }}>
            <Icon path={mdiEmailPlus} size={1} />
          </Button>
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEYS} />
        </Stack>
      </Toolbar>

      <Divider />

      <LoadingGuard
        isLoading={surveyMembersDataLoader.isLoading || !surveyMembersDataLoader.isReady}
        isLoadingFallback={<SkeletonTable data-testid="survey-participant-list-skeleton" />}
        isLoadingFallbackDelay={100}
        hasNoData={!surveyMembers.length}
        hasNoDataFallback={
          <NoDataOverlay
            minHeight="400px"
            title="Invite Members"
            subtitle="Users added to the Survey will appear here"
            icon={mdiArrowTopRight}
            data-testid="survey-participant-list-no-data-overlay"
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No participants found"
          loading={!surveyMembers.length && (surveyMembersDataLoader.isLoading || !surveyMembersDataLoader.isReady)}
          // Columns
          columns={columns}
          // Rows
          rows={surveyMembers}
          getRowId={(row) => row.survey_member_id}
          // Row options
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          // Column options
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          // Styling
          rowHeight={52}
          getRowHeight={() => 'auto'}
          autoHeight={false}
        />
      </LoadingGuard>

      <SurveyMemberDialog
        surveyId={surveyContext.surveyId}
        onSubmit={() => {
          surveyMembersDataLoader.refresh(advancedFiltersModel);
          setParticipantDialogIsOpen(false);
        }}
        onClose={() => {
          setParticipantDialogIsOpen(false);
        }}
        open={participantDialogIsOpen}
      />
      <SurveyMembersEmailDialog
        surveyId={surveyContext.surveyId}
        onSubmit={() => {
          surveyMembersDataLoader.refresh(advancedFiltersModel);
          setParticipantEmailDialogIsOpen(false);
        }}
        onClose={() => {
          setParticipantEmailDialogIsOpen(false);
        }}
        open={participantEmailDialogIsOpen}
      />
    </>
  );
};

export default SurveyMembersContainer;
