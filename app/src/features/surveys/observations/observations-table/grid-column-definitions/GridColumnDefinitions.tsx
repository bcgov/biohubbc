import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import ConditionalAutocompleteDataGridEditCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridEditCell';
import ConditionalAutocompleteDataGridViewCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridViewCell';
import TaxonomyDataGridEditCell from 'components/data-grid/taxonomy/TaxonomyDataGridEditCell';
import TaxonomyDataGridViewCell from 'components/data-grid/taxonomy/TaxonomyDataGridViewCell';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { CBMeasurementType, CBQualitativeOption } from 'interfaces/useCritterApi.interface';

export type ISampleSiteOption = {
  survey_sample_site_id: number;
  sample_site_name: string;
};

export type ISampleMethodOption = {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  sample_method_name: string;
  response_metric: string;
};

export type ISamplePeriodOption = {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  sample_period_name: string;
};

export const TaxonomyColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'itis_tsn',
    headerName: 'Species',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 250,
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
  sampleSiteOptions: ISampleSiteOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { sampleSiteOptions, hasError } = props;

  return {
    field: 'survey_sample_site_id',
    headerName: 'Sampling Site',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <AutocompleteDataGridViewCell<IObservationTableRow, number>
          dataGridProps={params}
          options={sampleSiteOptions.map((item) => ({
            label: item.sample_site_name,
            value: item.survey_sample_site_id
          }))}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <AutocompleteDataGridEditCell<IObservationTableRow, number>
          dataGridProps={params}
          options={sampleSiteOptions.map((item) => ({
            label: item.sample_site_name,
            value: item.survey_sample_site_id
          }))}
          error={hasError(params)}
        />
      );
    }
  };
};

export const SampleMethodColDef = (props: {
  sampleMethodOptions: ISampleMethodOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { sampleMethodOptions, hasError } = props;

  return {
    field: 'survey_sample_method_id',
    headerName: 'Sampling Method',
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <ConditionalAutocompleteDataGridViewCell<IObservationTableRow, ISampleMethodOption, number>
          dataGridProps={params}
          optionsGetter={(row, allOptions) => {
            return allOptions
              .filter((item) => item.survey_sample_site_id === row.survey_sample_site_id)
              .map((item) => ({ label: item.sample_method_name, value: item.survey_sample_method_id }));
          }}
          allOptions={sampleMethodOptions}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <ConditionalAutocompleteDataGridEditCell<IObservationTableRow, ISampleMethodOption, number>
          dataGridProps={params}
          optionsGetter={(row, allOptions) => {
            return allOptions
              .filter((item) => item.survey_sample_site_id === row.survey_sample_site_id)
              .map((item) => ({ label: item.sample_method_name, value: item.survey_sample_method_id }));
          }}
          allOptions={sampleMethodOptions}
          error={hasError(params)}
        />
      );
    }
  };
};

export const SamplePeriodColDef = (props: {
  samplePeriodOptions: ISamplePeriodOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { samplePeriodOptions, hasError } = props;

  return {
    field: 'survey_sample_period_id',
    headerName: 'Sampling Period',
    editable: true,
    hideable: true,
    flex: 0,
    width: 250,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <ConditionalAutocompleteDataGridViewCell<IObservationTableRow, ISamplePeriodOption, number>
          dataGridProps={params}
          optionsGetter={(row, allOptions) => {
            return allOptions
              .filter((item) => item.survey_sample_method_id === row.survey_sample_method_id)
              .map((item) => ({
                label: item.sample_period_name,
                value: item.survey_sample_period_id
              }));
          }}
          allOptions={samplePeriodOptions}
          error={hasError(params)}
        />
      );
    },
    renderEditCell: (params) => {
      return (
        <ConditionalAutocompleteDataGridEditCell<IObservationTableRow, ISamplePeriodOption, number>
          dataGridProps={params}
          optionsGetter={(row, allOptions) => {
            return allOptions
              .filter((item) => item.survey_sample_method_id === row.survey_sample_method_id)
              .map((item) => ({
                label: item.sample_period_name,
                value: item.survey_sample_period_id
              }));
          }}
          allOptions={samplePeriodOptions}
          error={hasError(params)}
        />
      );
    }
  };
};

export const ObservationCountColDef = (props: {
  sampleMethodOptions: ISampleMethodOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'count',
    headerName: 'Count',
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
      const error: boolean = hasError(params);

      const maxCount =
        props.sampleMethodOptions.find(
          (option) => option.survey_sample_method_id === params.row.survey_sample_method_id
        )?.response_metric === 'Presence-absence'
          ? 1
          : undefined;

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            type: 'number',
            inputProps: {
              max: maxCount,
              inputMode: 'numeric'
            },
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

export const ObservationActionsColDef = (props: {
  disabled: boolean;
  onDelete: (observationRecords: IObservationTableRow[]) => void;
}): GridColDef<IObservationTableRow> => {
  return {
    field: 'actions',
    headerName: '',
    type: 'actions',
    width: 70,
    disableColumnMenu: true,
    resizable: false,
    cellClassName: 'pinnedColumn',
    getActions: (params) => [
      <IconButton
        onClick={() => {
          props.onDelete([params.row]);
        }}
        disabled={props.disabled}
        key={`actions[${params.id}].handleDeleteRow`}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    ]
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
    editable: true,
    hideable: true,
    sortable: false,
    flex: 1,
    minWidth: Math.min(300, Math.max(250, measurement.measurement_name.length * 10 + 20)),
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
