import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { IObservationAnalyticsRow } from 'features/surveys/view/survey-spatial/components/observation/analytics/components/ObservationAnalyticsDataTableContainer';
import { IGroupByOption } from 'features/surveys/view/survey-spatial/components/observation/analytics/SurveyObservationAnalytics';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { getDateTimeLabel } from 'utils/datetime';

/**
 * Get the column definition for the row count.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getRowCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'row_count',
  headerName: 'Count of observations',
  type: 'number',
  flex: 1,
  minWidth: 150,
  sortable: false // Not yet supported by the API
});

/**
 * Get the column definition for the individual count.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getIndividualCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_count',
  headerName: 'Count of individuals',
  type: 'number',
  flex: 1,
  minWidth: 150,
  sortable: false // Not yet supported by the API
});

/**
 * Get the column definition for the individual percentage.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getIndividualPercentageColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_percentage',
  headerName: 'Percentage of individuals',
  type: 'number',
  flex: 1,
  minWidth: 150,
  sortable: false, // Not yet supported by the API
  renderCell: (params) => (
    <Typography variant="body2">
      {params.row.individual_percentage}&nbsp;
      <Typography variant="body2" component="span" color={grey[600]}>
        %
      </Typography>
    </Typography>
  )
});

/**
 * Get the column definition for the species.
 *
 * @param {((id: number) => IPartialTaxonomy | null)} getFunction
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSpeciesColDef = (
  getFunction: (id: number) => IPartialTaxonomy | null
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'itis_tsn',
  headerName: 'Species',
  flex: 1,
  minWidth: 150,
  sortable: false, // Not yet supported by the API
  renderCell: (params) => {
    if (!params.row.itis_tsn) {
      return null;
    }

    const species = getFunction(params.row.itis_tsn);

    return <ScientificNameTypography name={species?.scientificName ?? ''} />;
  }
});

/**
 * Get the column definition for the sampling site.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSamplingSiteColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_site_id',
  headerName: 'Site',
  flex: 1,
  minWidth: 150,
  sortable: false, // Not yet supported by the API
  renderCell: (params) => <Typography>{params.row.survey_sample_site_name}</Typography>
});

/**
 * Get the column definition for the method technique.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getMethodTechniqueColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'method_technique_id',
  headerName: 'Technique',
  flex: 1,
  minWidth: 150,
  sortable: false, // Not yet supported by the API
  renderCell: (params) => <Typography>{params.row.method_technique_name}</Typography>
});

/**
 * Get the column definition for the sampling period.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSamplingPeriodColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_period_id',
  headerName: 'Period',
  flex: 1,
  minWidth: 180,
  sortable: false, // Not yet supported by the API
  renderCell: (params) => {
    const label = getDateTimeLabel(
      params.row.start_date ?? null,
      params.row.start_time ?? null,
      params.row.end_date ?? null,
      params.row.end_time ?? null
    );

    return <Typography>{label}</Typography>;
  }
});

/**
 * Get the column definition for the date.
 *
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getDateColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'observation_date',
  headerName: 'Date',
  minWidth: 150,
  flex: 1,
  sortable: false, // Not yet supported by the API
  renderCell: (params) =>
    params.row.observation_date ? (
      <Typography>{dayjs(params.row.observation_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
    ) : null
});

/**
 * Get basic group by column definitions for the provided group by options.
 *
 * @param {IGroupByOption[]} groupByOptions
 * @return {*}  {GridColDef<IObservationAnalyticsRow>[]}
 */
export const getBasicGroupByColDefs = (groupByOptions: IGroupByOption[]): GridColDef<IObservationAnalyticsRow>[] => {
  if (!groupByOptions.length) {
    return [];
  }

  return groupByOptions.map((item) => ({
    field: item.field,
    headerName: item.label,
    minWidth: 150,
    flex: 1
  }));
};
