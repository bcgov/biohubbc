import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { IObservationAnalyticsRow } from 'features/surveys/view/components/analytics/components/ObservationAnalyticsDataTableContainer';
import { IGroupByOption } from 'features/surveys/view/components/analytics/SurveyObservationAnalytics';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import isEqual from 'lodash-es/isEqual';

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
  minWidth: 150
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
  minWidth: 150
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
 * @param {IGetSampleLocationDetails[]} sampleSites
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSamplingSiteColDef = (
  sampleSites: IGetSampleLocationDetails[]
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_site_id',
  headerName: 'Site',
  flex: 1,
  minWidth: 150,
  renderCell: (params) => {
    if (!params.row.survey_sample_site_id) {
      return null;
    }

    const site = sampleSites.find((site) => isEqual(params.row.survey_sample_site_id, site.survey_sample_site_id));

    if (!site) {
      return null;
    }

    return <Typography>{site.name}</Typography>;
  }
});

/**
 * Get the column definition for the sampling method.
 *
 * @param {IGetSampleLocationDetails[]} sampleSites
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSamplingMethodColDef = (
  sampleSites: IGetSampleLocationDetails[]
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_method_id',
  headerName: 'Method',
  flex: 1,
  minWidth: 150,
  renderCell: (params) => {
    if (!params.row.survey_sample_method_id) {
      return null;
    }

    const method = sampleSites
      .flatMap((site) => site.sample_methods)
      .find((method) => isEqual(params.row.survey_sample_method_id, method.survey_sample_method_id));

    if (!method) {
      return null;
    }

    return <Typography>{method.technique.name}</Typography>;
  }
});

/**
 * Get the column definition for the sampling period.
 *
 * @param {IGetSampleLocationDetails[]} sampleSites
 * @return {*}  {GridColDef<IObservationAnalyticsRow>}
 */
export const getSamplingPeriodColDef = (
  sampleSites: IGetSampleLocationDetails[]
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_period_id',
  headerName: 'Period',
  flex: 1,
  minWidth: 180,
  renderCell: (params) => {
    if (!params.row.survey_sample_period_id) {
      return null;
    }

    const period = sampleSites
      .flatMap((site) => site.sample_methods)
      .flatMap((method) => method.sample_periods)
      .find((period) => isEqual(params.row.survey_sample_period_id, period.survey_sample_period_id));

    if (!period) {
      return null;
    }

    return (
      <Typography>
        {dayjs(period.start_date).format(DATE_FORMAT.ShortMediumDateFormat)}&ndash;
        {dayjs(period.end_date).format(DATE_FORMAT.ShortMediumDateFormat)}
      </Typography>
    );
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
    minWidth: 200
  }));
};
