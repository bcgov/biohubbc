import { Box, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography } from '@mui/material';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { WideToTallOptions } from './CSVWideToTall';

interface CSVTransformOptionsProps {
  file: File | null;
  onTransformOptionsChange: (options: WideToTallOptions) => void;
}

/**
 * Component for selecting transformation options for wide-to-tall CSV conversion
 *
 * @param {CSVTransformOptionsProps} props Component props
 * @returns {JSX.Element} The component JSX
 */
export const CSVTransformOptions = (props: CSVTransformOptionsProps): JSX.Element => {
  const { file, onTransformOptionsChange } = props;

  // Column states
  const [columns, setColumns] = useState<string[]>([]);
  const [valueVars, setValueVars] = useState<string[]>([]);
  const [excludeColumns, setExcludeColumns] = useState<string[]>([]);
  const [variableColumnName, setVariableColumnName] = useState<string>('variable');

  // Parse the CSV file to get column names when file changes
  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true,
        preview: 1, // Only need to read the header row
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const columnNames = Object.keys(results.data[0] as Record<string, any>);
            setColumns(columnNames);
          }
        }
      });
    }
  }, [file]);

  // Update parent component when options change
  useEffect(() => {
    onTransformOptionsChange({
      valueVars,
      excludeColumns,
      variableColumnName
    });
  }, [valueVars, excludeColumns, variableColumnName, onTransformOptionsChange]);

  const handleValueVarsChange = (column: string) => {
    setValueVars((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleExcludeColumnsChange = (column: string) => {
    setExcludeColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  if (!file || columns.length === 0) {
    return <Box>Please upload a CSV file to see transformation options</Box>;
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Transform Options
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select columns to transform into rows:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These columns will be converted into a "long" format where each value becomes a separate row.
        </Typography>
        <FormGroup>
          {columns.map((column) => (
            <FormControlLabel
              key={`transform-${column}`}
              control={<Checkbox checked={valueVars.includes(column)} onChange={() => handleValueVarsChange(column)} />}
              label={column}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Exclude columns:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These columns will be excluded from the output (e.g., totals or redundant columns).
        </Typography>
        <FormGroup>
          {columns.map((column) => (
            <FormControlLabel
              key={`exclude-${column}`}
              control={
                <Checkbox
                  checked={excludeColumns.includes(column)}
                  onChange={() => handleExcludeColumnsChange(column)}
                />
              }
              label={column}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          New column name:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the name for the column that will contain the original column names.
        </Typography>
        // Tech debt - This should have an autofill feature that allows the user to click on existing column names in
        the standards based on itis tsn. AS of right now its just a text field.
        <TextField
          fullWidth
          value={variableColumnName}
          onChange={(e) => setVariableColumnName(e.target.value)}
          placeholder="variable"
          helperText="This will be the name of the column that contains the original column names"
          sx={{ mt: 1 }}
        />
      </Box>
    </Box>
  );
};
