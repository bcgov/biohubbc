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
import TimePickerDataGrid from 'components/data-grid/TimePickerDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { default as dayjs } from 'dayjs';
import { Measurement, MeasurementOption } from 'hooks/cb_api/useLookupApi';
import { getFormattedDate } from 'utils/Utils';

export type ISampleSiteOption = {
  survey_sample_site_id: number;
  sample_site_name: string;
};

export type ISampleMethodOption = {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  sample_method_name: string;
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

export const ObservationDateColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'observation_date',
    headerName: 'Date',
    editable: true,
    hideable: true,
    type: 'date',
    minWidth: 150,
    valueGetter: (params) => (params.row.observation_date ? dayjs(params.row.observation_date).toDate() : null),
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, params.value)}
      </Typography>
    ),
    renderEditCell: (params) => {
      const error = hasError(params);

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            name: params.field,
            type: 'date',
            value: params.value ? dayjs(params.value).format('YYYY-MM-DD') : '',
            onChange: (event) => {
              const value = dayjs(event.target.value).toDate();

              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value
              });
            },

            error
          }}
        />
      );
    }
  };
};

export const ObservationTimeColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'observation_time',
    headerName: 'Time',
    editable: true,
    hideable: true,
    type: 'string',
    width: 150,
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    valueSetter: (params) => {
      return { ...params.row, observation_time: params.value };
    },
    valueParser: (value) => {
      if (!value) {
        return null;
      }

      if (dayjs.isDayjs(value)) {
        return value.format('HH:mm:ss');
      }

      return dayjs(value, 'HH:mm:ss').format('HH:mm:ss');
    },
    renderCell: (params) => {
      if (!params.value) {
        return null;
      }

      return (
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          {params.value}
        </Typography>
      );
    },
    renderEditCell: (params) => {
      const error = hasError(params);

      return (
        <TimePickerDataGrid
          dataGridProps={params}
          dateFieldProps={{
            slotProps: {
              textField: {
                error,
                name: params.field
              }
            }
          }}
        />
      );
    }
  };
};

export const ObservationLatitudeColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'latitude',
    headerName: 'Lat',
    editable: true,
    hideable: true,
    width: 120,
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    valueSetter: (params) => {
      if (/^-?\d{1,3}(?:\.\d{0,12})?$/.test(params.value)) {
        // If the value is a legal latitude value
        // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
        return { ...params.row, latitude: Number(params.value) };
      }

      const value = parseFloat(params.value);
      return { ...params.row, latitude: isNaN(value) ? null : value };
    },
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {params.value}
      </Typography>
    ),
    renderEditCell: (params) => {
      const error: boolean = hasError(params);

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            name: params.field,
            onChange: (event) => {
              if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                // If the value is not a subset of a legal latitude value, prevent the value from being applied
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

export const ObservationLongitudeColDef = (props: {
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { hasError } = props;

  return {
    field: 'longitude',
    headerName: 'Long',
    editable: true,
    hideable: true,
    width: 120,
    disableColumnMenu: true,
    headerAlign: 'right',
    align: 'right',
    valueSetter: (params) => {
      if (/^-?\d{1,3}(?:\.\d{0,12})?$/.test(params.value)) {
        // If the value is a legal longitude value
        // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
        return { ...params.row, longitude: Number(params.value) };
      }

      const value = parseFloat(params.value);
      return { ...params.row, longitude: isNaN(value) ? null : value };
    },
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
        {params.value}
      </Typography>
    ),
    renderEditCell: (params) => {
      const error: boolean = hasError(params);

      return (
        <TextFieldDataGrid
          dataGridProps={params}
          textFieldProps={{
            name: params.field,
            onChange: (event) => {
              if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                // If the value is not a subset of a legal longitude value, prevent the value from being applied
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
  measurement: Measurement;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { measurement, hasError } = props;

  return {
    field: measurement.uuid,
    headerName: measurement.measurementName,
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
  measurement: Measurement;
  measurementOptions: MeasurementOption[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IObservationTableRow> => {
  const { measurement, measurementOptions, hasError } = props;

  return {
    field: measurement.uuid,
    headerName: measurement.measurementName,
    editable: true,
    hideable: true,
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => {
      return (
        <AutocompleteDataGridViewCell dataGridProps={params} options={measurementOptions} error={hasError(params)} />
      );
    },
    renderEditCell: (params) => {
      const error = hasError(params);

      return <AutocompleteDataGridEditCell dataGridProps={params} options={measurementOptions} error={error} />;
    }
  };
};
