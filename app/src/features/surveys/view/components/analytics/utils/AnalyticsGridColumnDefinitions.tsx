import Typography from '@mui/material/Typography';
import grey from '@mui/material/colors/grey';
import { GridColDef } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ITaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { IObservationAnalyticsRow } from '../ObservationAnalyticsDataTable';

export const getRowCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'row_count',
  headerName: 'Number of rows',
  type: 'number',
  flex: 1,
  minWidth: 90
});

export const getIndividualCountColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_count',
  headerName: 'Number of individuals',
  type: 'number',
  flex: 1,
  minWidth: 90
});

export const getIndividualPercentageColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'individual_percentage',
  headerName: 'Percentage of individuals',
  type: 'number',
  flex: 1,
  minWidth: 90,
  renderCell: (params) => (
    <Typography variant="body2">
      {params.row.individual_percentage}&nbsp;
      <Typography variant="body2" component="span" color={grey[600]}>
        %
      </Typography>
    </Typography>
  )
});

export const getSpeciesColDef = (taxonomyContext: ITaxonomyContext): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'itis_tsn',
  headerName: 'Species',
  flex: 1,
  minWidth: 90,
  renderCell: (params) => {
    if (params.row.itis_tsn) {
      const species = taxonomyContext.getCachedSpeciesTaxonomyById(params.row.itis_tsn);
      return <ScientificNameTypography name={species?.scientificName ?? ''} />;
    }
  }
});

export const getSamplingSiteColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_site_id',
  headerName: 'Site',
  flex: 1,
  minWidth: 90,
  renderCell: (params) => <Typography>{params.row.survey_sample_site_id}</Typography>
});

export const getSamplingMethodColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'row.survey_sample_method_id',
  headerName: 'Method',
  flex: 1,
  minWidth: 90,
  renderCell: (params) => <Typography>{params.row.survey_sample_method_id}</Typography>
});

export const getSamplingPeriodColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'survey_sample_period_id',
  headerName: 'Period',
  flex: 1,
  minWidth: 90,
  renderCell: (params) => <Typography>{params.row.survey_sample_period_id}</Typography>
});

export const getDateColDef = (): GridColDef<IObservationAnalyticsRow> => ({
  headerAlign: 'left',
  align: 'left',
  field: 'observation_date',
  headerName: 'Date',
  flex: 1,
  minWidth: 90,
  renderCell: (params) =>
    params.row.observation_date ? (
      <Typography>{dayjs(params.row.observation_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
    ) : (
      null
    )
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
      flex: 1,
      minWidth: 80
    }))
];
