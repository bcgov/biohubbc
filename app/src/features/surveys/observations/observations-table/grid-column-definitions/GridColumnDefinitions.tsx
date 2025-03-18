import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import TaxonomyDataGridViewCell from 'components/data-grid/taxonomy/TaxonomyDataGridViewCell';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { SamplePeriodDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGridViewCell';
import { SampleSiteDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGridViewCell';
import { MethodTechniqueDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/techniques/MethodTechniqueDataGridViewCell';
import { SamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { CBMeasurementType, CBQualitativeOption } from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';

type IObservationSignOption = {
  observation_sign_id: number;
  name: string;
};

export const TaxonomyColDef = (): GridColDef<IObservationTableRow> => {
  return {
    field: 'itis_tsn',
    headerName: 'Species',
    description: 'The observed species, or if the species is unknown, a higher taxon',
    editable: false,
    hideable: true,
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    valueSetter: (params) => {
      return { ...params.row, itis_tsn: Number(params.value) };
    },
    renderCell: (params) => {
      return <TaxonomyDataGridViewCell dataGridProps={params} />;
    }
  };
};

export const SampleSiteColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache } = props;

  return {
    field: 'survey_sample_site_id',
    description: 'The sampling site where the observation was made',
    headerName: 'Site',
    editable: false,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return <SampleSiteDataGridViewCell dataGridProps={params} samplingInformationCache={samplingInformationCache} />;
    }
  };
};

export const MethodTechniqueColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache } = props;

  return {
    field: 'method_technique_id',
    headerName: 'Technique',
    description: 'The technique with which the observation was made',
    editable: false,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <MethodTechniqueDataGridViewCell dataGridProps={params} samplingInformationCache={samplingInformationCache} />
      );
    }
  };
};

export const SamplePeriodColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache } = props;

  return {
    field: 'survey_sample_period_id',
    headerName: 'Period',
    description: 'The sampling period in which the observation was made',
    editable: false,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <SamplePeriodDataGridViewCell dataGridProps={params} samplingInformationCache={samplingInformationCache} />
      );
    }
  };
};

export const ObservationSubcountColDef = (): GridColDef<IObservationTableRow> => {
  return {
    field: 'subcount',
    headerName: 'Count',
    description: 'The number of individuals observed',
    editable: false,
    hideable: true,
    type: 'number',
    minWidth: 110,
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {params.value}
      </Typography>
    )
  };
};

export const ObservationSignColDef = (props: {
  observationSignOptions: IObservationSignOption[];
}): GridColDef<IObservationTableRow> => {
  const { observationSignOptions } = props;

  const signOptions = observationSignOptions.map((item) => ({
    label: item.name,
    value: item.observation_sign_id
  }));

  return {
    field: 'observation_sign_id',
    headerName: 'Sign',
    description: 'The sign of the observation',
    editable: false,
    hideable: true,
    minWidth: 140,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return <AutocompleteDataGridViewCell dataGridProps={params} options={signOptions} />;
    }
  };
};

export const ObservationQuantitativeMeasurementColDef = (props: {
  measurement: CBMeasurementType;
}): GridColDef<IObservationTableRow> => {
  const { measurement } = props;
  return {
    field: measurement.taxon_measurement_id,
    headerName: measurement.measurement_name,
    description: measurement.measurement_desc ?? '',
    editable: false,
    hideable: true,
    sortable: false,
    type: 'number',
    minWidth: Math.min(300, Math.max(110, measurement.measurement_name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {params.value}
      </Typography>
    )
  };
};

export const ObservationQualitativeMeasurementColDef = (props: {
  measurement: CBMeasurementType;
  measurementOptions: CBQualitativeOption[];
}): GridColDef<IObservationTableRow> => {
  const { measurement, measurementOptions } = props;

  const qualitativeOptions = measurementOptions.map((item) => ({
    label: item.option_label,
    value: item.qualitative_option_id
  }));
  return {
    field: measurement.taxon_measurement_id,
    headerName: measurement.measurement_name,
    description: measurement.measurement_desc ?? '',
    editable: false,
    hideable: true,
    sortable: false,
    flex: 1,
    minWidth: Math.min(300, Math.max(180, measurement.measurement_name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return <AutocompleteDataGridViewCell dataGridProps={params} options={qualitativeOptions} />;
    }
  };
};

export const ObservationQuantitativeEnvironmentColDef = (props: {
  environment: EnvironmentQuantitativeTypeDefinition;
}): GridColDef<IObservationTableRow> => {
  const { environment } = props;
  return {
    field: String(environment.environment_quantitative_id),
    headerName: environment.name,
    description: environment.description ?? '',
    editable: false,
    hideable: true,
    sortable: false,
    type: 'number',
    minWidth: Math.min(300, Math.max(110, environment.name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {params.value}
      </Typography>
    )
  };
};

export const ObservationQualitativeEnvironmentColDef = (props: {
  environment: EnvironmentQualitativeTypeDefinition;
}): GridColDef<IObservationTableRow> => {
  const { environment } = props;

  const qualitativeOptions = environment.options.map((item) => ({
    label: item.name,
    value: item.environment_qualitative_option_id
  }));
  return {
    field: String(environment.environment_qualitative_id),
    headerName: environment.name,
    description: environment.description ?? '',
    editable: false,
    hideable: true,
    sortable: false,
    flex: 1,
    minWidth: Math.min(300, Math.max(180, environment.name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return <AutocompleteDataGridViewCell dataGridProps={params} options={qualitativeOptions} />;
    }
  };
};
