import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import {
  IGetSampleLocationDetails,
  IGetSampleMethodDetails,
  IGetSamplePeriodRecord
} from 'interfaces/useSamplingSiteApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { IObservationAnalyticsRow } from '../../ObservationAnalyticsDataTable';

export const getRowCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'row_count',
  headerName: 'Number of observations',
  type: 'number',
  flex: 1,
  minWidth: 180
});

export const getIndividualCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_count',
  headerName: 'Number of individuals',
  type: 'number',
  flex: 1,
  minWidth: 180
});

export const getIndividualPercentageColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_percentage',
  headerName: 'Percentage of individuals',
  type: 'number',
  flex: 1,
  minWidth: 180,
  renderCell: (params) => (
    <Typography variant="body2">
      {params.row.individual_percentage}&nbsp;
      <Typography variant="body2" component="span" color={grey[600]}>
        %
      </Typography>
    </Typography>
  )
});

export const getSpeciesColDef = (
  getFunction: (id: number) => IPartialTaxonomy | null
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'itis_tsn',
  headerName: 'Species',

  minWidth: 180,
  renderCell: (params) => {
    if (params.row.itis_tsn) {
      const species = getFunction(params.row.itis_tsn);
      return <ScientificNameTypography name={species?.scientificName ?? ''} />;
    }
  }
});

export const getSamplingSiteColDef = (
  getFunction: (id: number) => IGetSampleLocationDetails | undefined
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_site_id',
  headerName: 'Site',

  minWidth: 180,
  renderCell: (params) => {
    if (params.row.survey_sample_site_id) {
      const site = getFunction(params.row.survey_sample_site_id);
      return <Typography>{site?.name}</Typography>;
    }
  }
});

export const getSamplingMethodColDef = (
  getFunction: (id: number) => IGetSampleMethodDetails | undefined
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'row.survey_sample_method_id',
  headerName: 'Method',

  minWidth: 180,
  renderCell: (params) => {
    if (params.row.survey_sample_method_id) {
      const method = getFunction(params.row.survey_sample_method_id);
      return <Typography>{method?.technique.method_lookup_id}</Typography>;
    }
  }
});

export const getSamplingPeriodColDef = (
  getFunction: (id: number) => IGetSamplePeriodRecord | undefined
): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_period_id',
  headerName: 'Period',
  minWidth: 220,
  renderCell: (params) => {
    if (params.row.survey_sample_period_id) {
      const period = getFunction(params.row.survey_sample_period_id);
      return (
        <Typography>
          {dayjs(period?.start_date).format(DATE_FORMAT.ShortMediumDateFormat)}&ndash;
          {dayjs(period?.end_date).format(DATE_FORMAT.ShortMediumDateFormat)}
        </Typography>
      );
    }
  }
});

export const getDateColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'observation_date',
  headerName: 'Date',

  minWidth: 180,
  renderCell: (params) =>
    params.row.observation_date ? (
      <Typography>{dayjs(params.row.observation_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
    ) : null
});

export const getDynamicColumns = (
  rows: IObservationAnalyticsRow[],
  columnsToExclude: string[]
): GridColDef<IObservationAnalyticsRow>[] => [
  ...Object.keys(rows[0])
    .filter((field) => field !== 'id' && !columnsToExclude.includes(field))
    .map((field) => ({
      field,
      headerName: field,

      minWidth: 80
    }))
];
