import { Box, Divider, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

// Interface for column mapping
export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

// Standard system column names
const SYSTEM_COLUMN_NAMES = [
  'species',
  'location',
  'date',
  'count',
  'sex',
  'age',
  'observer',
  'project',
  'method',
  'notes'
  // Add more standard column names as needed
];

interface CSVColumnMappingProps {
  file: File | null;
  onColumnMappingChange: (mapping: ColumnMapping[]) => void;
}

/**
 * Component for mapping CSV columns to system standard columns
 *
 * @param {CSVColumnMappingProps} props Component props
 * @returns {JSX.Element} The component JSX
 */
export const CSVColumnMapping = (props: CSVColumnMappingProps): JSX.Element => {
  const { file, onColumnMappingChange } = props;

  // Column states
  const [columns, setColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [customColumnNames, setCustomColumnNames] = useState<Record<string, string>>({});

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

            // Initialize mapping with empty target columns
            const initialMapping = columnNames.map((col) => ({
              sourceColumn: col,
              targetColumn: ''
            }));
            setColumnMapping(initialMapping);
          }
        }
      });
    }
  }, [file]);

  // Update parent component when mapping changes
  useEffect(() => {
    onColumnMappingChange(columnMapping);
  }, [columnMapping, onColumnMappingChange]);

  const handleMappingChange = (sourceColumn: string, targetColumn: string) => {
    setColumnMapping((prev) =>
      prev.map((mapping) => (mapping.sourceColumn === sourceColumn ? { ...mapping, targetColumn } : mapping))
    );
  };

  const handleCustomColumnNameChange = (sourceColumn: string, customName: string) => {
    setCustomColumnNames((prev) => ({
      ...prev,
      [sourceColumn]: customName
    }));

    // Update the mapping with the custom column name
    if (customName.trim()) {
      handleMappingChange(sourceColumn, customName);
    }
  };

  if (!file || columns.length === 0) {
    return <Box>Please upload a CSV file to see column mapping options</Box>;
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Column Mapping
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Map your CSV columns to standard column names in our system. This helps standardize your data for analysis.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {columns.map((sourceColumn) => (
        <Box key={sourceColumn} sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ width: '200px', flexShrink: 0 }}>{sourceColumn}:</Typography>

          <FormControl sx={{ width: '250px', mr: 2 }}>
            <Select
              value={columnMapping.find((m) => m.sourceColumn === sourceColumn)?.targetColumn || ''}
              onChange={(e) => handleMappingChange(sourceColumn, e.target.value)}
              displayEmpty>
              <MenuItem value="">
                <em>Select system column</em>
              </MenuItem>
              {SYSTEM_COLUMN_NAMES.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
              <MenuItem value="custom">
                <em>Custom name...</em>
              </MenuItem>
            </Select>
          </FormControl>

          {columnMapping.find((m) => m.sourceColumn === sourceColumn)?.targetColumn === 'custom' && (
            <TextField
              value={customColumnNames[sourceColumn] || ''}
              onChange={(e) => handleCustomColumnNameChange(sourceColumn, e.target.value)}
              placeholder="Enter custom column name"
              size="small"
              sx={{ width: '250px' }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};
