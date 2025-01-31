import Typography from '@mui/material/Typography';
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import TaxonomyDataGridEditCell from 'components/data-grid/taxonomy/TaxonomyDataGridEditCell';
import TaxonomyDataGridViewCell from 'components/data-grid/taxonomy/TaxonomyDataGridViewCell';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { ObservationCountDataGridEditCell } from 'features/surveys/observations/observations-table/grid-column-definitions/count/ObservationCountDataGridEditCell';
import { SamplePeriodDataGridEditCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGridEditCell';
import { SamplePeriodDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGridViewCell';
import { SampleSiteDataGridEditCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGridEditCell';
import { SampleSiteDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGridViewCell';
import { MethodTechniqueDataGridEditCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/techniques/MethodTechniqueDataGridEditCell';
import { MethodTechniqueDataGridViewCell } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/techniques/MethodTechniqueDataGridViewCell';
import { SamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { CBMeasurementType, CBQualitativeOption } from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';

type IObservationSubcountSignOption = {
  observation_sign_id: number;
  name: string;
};

export const TaxonomyColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'itis_tsn',
    headerName: 'Species',
    description: 'The observed species, or if the species is unknown, a higher taxon',
    editable: true,
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
      return <TaxonomyDataGridViewCell dataGridProps={params} error={hasError(params)} />;
    },
    renderEditCell: (params) => {
      return <TaxonomyDataGridEditCell dataGridProps={params} error={hasError(params)} />;
    }
  };
};

export const SampleSiteColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache, hasError } = props;

  return {
    field: 'survey_sample_site_id',
    description: 'The sampling site where the observation was made',
    headerName: 'Site',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <SampleSiteDataGridViewCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <SampleSiteDataGridEditCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    }
  };
};

export const MethodTechniqueColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache, hasError } = props;

  return {
    field: 'method_technique_id',
    headerName: 'Technique',
    description: 'The technique with which the observation was made',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <MethodTechniqueDataGridViewCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <MethodTechniqueDataGridEditCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    }
  };
};

export const SamplePeriodColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache, hasError } = props;

  return {
    field: 'survey_sample_period_id',
    headerName: 'Period',
    description: 'The sampling period in which the observation was made',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <SamplePeriodDataGridViewCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <SamplePeriodDataGridEditCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    }
  };
};

export const ObservationCountColDef = (props: {
  samplingInformationCache: SamplingInformationCache;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { samplingInformationCache, hasError } = props;

  return {
    field: 'count',
    headerName: 'Count',
    description: 'The number of individuals observed',
    editable: true,
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
    ),
    renderEditCell: (params) => {
      return (
        <ObservationCountDataGridEditCell
          dataGridProps={params}
          samplingInformationCache={samplingInformationCache}
          error={hasError(params)}
        />
      );
    }
  };
};

export const ObservationSignColDef = (props: {
  observationSignOptions: IObservationSubcountSignOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { observationSignOptions, hasError } = props;

  const signOptions = observationSignOptions.map((item) => ({
    label: item.name,
    value: item.observation_sign_id
  }));

  return {
    field: 'observation_sign_id',
    headerName: 'Sign',
    description: 'The sign of the observation',
    editable: true,
    hideable: true,
    minWidth: 140,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return <AutocompleteDataGridViewCell dataGridProps={params} options={signOptions} error={hasError(params)} />;
    },
    renderEditCell: (params) => {
      return <AutocompleteDataGridEditCell dataGridProps={params} options={signOptions} error={hasError(params)} />;
    }
  };
};

export const ObservationQuantitativeMeasurementColDef = (props: {
  measurement: CBMeasurementType;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { measurement, hasError } = props;
  return {
    field: measurement.taxon_measurement_id,
    headerName: measurement.measurement_name,
    description: measurement.measurement_desc ?? '',
    editable: true,
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
    ),
    renderEditCell: (params) => {
      const error = hasError(params);

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            name: params.field,
            onChange: (event) => {
              if (!/^\d{0,7}$/.test(event.target.value)) {
                // If the value is not a number, return
                return;
              }

              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: event.target.value
              });
            },
            error
          }}
        />
      );
    }
  };
};

export const ObservationQualitativeMeasurementColDef = (props: {
  measurement: CBMeasurementType;
  measurementOptions: CBQualitativeOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { measurement, measurementOptions, hasError } = props;

  const qualitativeOptions = measurementOptions.map((item) => ({
    label: item.option_label,
    value: item.qualitative_option_id
  }));
  return {
    field: measurement.taxon_measurement_id,
    headerName: measurement.measurement_name,
    description: measurement.measurement_desc ?? '',
    editable: true,
    hideable: true,
    sortable: false,
    flex: 1,
    minWidth: Math.min(300, Math.max(180, measurement.measurement_name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <AutocompleteDataGridViewCell dataGridProps={params} options={qualitativeOptions} error={hasError(params)} />
      );
    },
    renderEditCell: (params) => {
      return (
        <AutocompleteDataGridEditCell dataGridProps={params} options={qualitativeOptions} error={hasError(params)} />
      );
    }
  };
};

export const ObservationQuantitativeEnvironmentColDef = (props: {
  environment: EnvironmentQuantitativeTypeDefinition;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { environment, hasError } = props;
  return {
    field: String(environment.environment_quantitative_id),
    headerName: environment.name,
    description: environment.description ?? '',
    editable: true,
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
    ),
    renderEditCell: (params) => {
      const error = hasError(params);

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            name: params.field,
            onChange: (event) => {
              if (!/^\d{0,7}$/.test(event.target.value)) {
                // If the value is not a number, return
                return;
              }

              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: event.target.value
              });
            },
            error
          }}
        />
      );
    }
  };
};

export const ObservationQualitativeEnvironmentColDef = (props: {
  environment: EnvironmentQualitativeTypeDefinition;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { environment, hasError } = props;

  const qualitativeOptions = environment.options.map((item) => ({
    label: item.name,
    value: item.environment_qualitative_option_id
  }));
  return {
    field: String(environment.environment_qualitative_id),
    headerName: environment.name,
    description: environment.description ?? '',
    editable: true,
    hideable: true,
    sortable: false,
    flex: 1,
    minWidth: Math.min(300, Math.max(180, environment.name.length * 10 + 20)),
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <AutocompleteDataGridViewCell dataGridProps={params} options={qualitativeOptions} error={hasError(params)} />
      );
    },
    renderEditCell: (params) => {
      return (
        <AutocompleteDataGridEditCell dataGridProps={params} options={qualitativeOptions} error={hasError(params)} />
      );
    }
  };
};
