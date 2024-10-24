import { mdiCommentOutline, mdiCommentText, mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Link, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridCellParams, GridColDef, GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import TimePickerDataGrid from 'components/data-grid/TimePickerDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { round } from 'lodash-es';
import appTheme from 'themes/appTheme';
import { getFormattedDate, getFormattedFileSize } from 'utils/Utils';

export const GenericDateColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  description?: string;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<T> => {
  const { field, headerName, hasError, description } = props;

  return {
    field,
    headerName,
    description: description,
    editable: true,
    hideable: true,
    type: 'date',
    minWidth: 150,
    valueFormatter: (params) => dayjs(params.value).format('YYYY-MM-DD'),
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
            value: params.value ?? '',
            inputProps: { max: '9999-12-31', min: '0001-01-01' },
            onChange: (event) => {
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

export const GenericTimeColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  description?: string;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<T> => {
  const { hasError, field, headerName, description } = props;

  return {
    field,
    headerName,
    editable: true,
    hideable: true,
    description: description,
    type: 'string',
    width: 150,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    valueSetter: (params) => {
      return { ...params.row, [field]: params.value };
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

export const GenericLatitudeColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  description?: string;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<T> => {
  const { hasError, field, headerName, description } = props;

  return {
    field,
    headerName,
    description: description,
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
        {isNaN(parseFloat(params.value)) ? null : round(params.value, 5)}
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

export const GenericLongitudeColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  description?: string;
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<T> => {
  const { hasError, field, headerName, description } = props;

  return {
    field,
    headerName,
    description: description,
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
        {isNaN(parseFloat(params.value)) ? null : round(params.value, 5)}
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

export const GenericCommentColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  description?: string;
  hasError: (params: GridCellParams) => boolean;
  handleClose: () => void;
  handleOpen: (params: GridRenderEditCellParams) => void;
}): GridColDef<T> => {
  const { field, headerName, description } = props;

  return {
    field,
    headerName,
    description: description,
    width: 75,
    disableColumnMenu: true,
    editable: true,
    align: 'center',
    renderEditCell: (params) => {
      return (
        <Tooltip title={params.value} arrow>
          <span>
            <IconButton
              aria-label="observation-subcount-comment"
              onClick={() => {
                props.handleOpen(params);
              }}>
              {params.value ? (
                // The key prop is necessary for the color to correctly change when a value is set
                <Icon path={mdiCommentText} size={1} key="comment-view-id" color={appTheme.palette.primary.dark} />
              ) : (
                <Icon
                  path={mdiCommentOutline}
                  size={1}
                  key="comment-view-empty"
                  color={appTheme.palette.primary.dark}
                />
              )}
            </IconButton>
          </span>
        </Tooltip>
      );
    },
    renderCell: (params) => {
      return (
        <Tooltip title={params.value} arrow>
          <span>
            <IconButton aria-label="observation-subcount-comment" disabled>
              {params.value ? (
                <Icon path={mdiCommentText} size={1} key="comment-view-id" color={appTheme.palette.primary.dark} />
              ) : (
                <Icon path={mdiCommentOutline} size={1} key="comment-view-empty" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      );
    }
  };
};

export const GenericFileNameColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
  onClick?: (params: GridCellParams) => void;
}): GridColDef<T> => {
  return {
    field: props.field,
    headerName: props.headerName,
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
          <Icon path={mdiFileOutline} size={1} />
          <Link underline="always" onClick={() => props.onClick?.(params)} tabIndex={0}>
            {params.value}
          </Link>
        </Stack>
      );
    }
  };
};

export const GenericFileSizeColDef = <T extends GridValidRowModel>(props: {
  field: string;
  headerName: string;
}): GridColDef<T> => {
  return {
    field: props.field,
    headerName: props.headerName,
    flex: 1,
    disableColumnMenu: true,
    valueGetter: (params) => {
      return getFormattedFileSize(params.value);
    }
  };
};
