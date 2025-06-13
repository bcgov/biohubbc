import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

// Interface for value mapping
export interface ValueMapping {
  column: string;
  originalValue: string;
  newValue: string;
}

interface CSVValueMappingProps {
  file: File | null;
  onValueMappingChange: (mapping: ValueMapping[]) => void;
  standardizedValues?: Record<string, string[]>; // Optional standardized values for columns
  onFileUpdate?: (newFile: File, fileName: string) => void; // Callback for when file is updated with mappings
}

/**
 * Component for mapping CSV column values to standardized values
 *
 * @param {CSVValueMappingProps} props Component props
 * @returns {JSX.Element} The component JSX
 */
export const CSVValueMapping = (props: CSVValueMappingProps): JSX.Element => {
  const { file, onValueMappingChange, standardizedValues = {}, onFileUpdate } = props;

  // State
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [uniqueValues, setUniqueValues] = useState<Record<string, Set<string>>>({});
  const [valueMapping, setValueMapping] = useState<ValueMapping[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApplyingMapping, setIsApplyingMapping] = useState<boolean>(false);

  // Parse the CSV file to get column names when file changes
  useEffect(() => {
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        header: true,
        preview: 1, // Only need to read the header row for column names
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const columnNames = Object.keys(results.data[0] as Record<string, any>);
            setColumns(columnNames);
            setIsLoading(false);
          }
        },
        error: () => {
          setIsLoading(false);
        }
      });
    }
  }, [file]);

  // When a column is selected, extract all unique values from that column
  useEffect(() => {
    if (!file || !selectedColumn) {
      return;
    }

    // Skip if we already have the unique values for this column
    if (uniqueValues[selectedColumn] && uniqueValues[selectedColumn].size > 0) {
      return;
    }

    setIsLoading(true);
    const values = new Set<string>();

    Papa.parse(file, {
      header: true,
      step: (results) => {
        // For each row, get the value of the selected column and add it to our Set
        const row = results.data as Record<string, any>;
        const value = row[selectedColumn]?.toString();
        if (value !== undefined && value !== null && value !== '') {
          values.add(value);
        }
      },
      complete: () => {
        setUniqueValues((prev) => ({
          ...prev,
          [selectedColumn]: values
        }));

        // Initialize mappings for this column with empty new values
        const initialMappings = Array.from(values).map((value) => ({
          column: selectedColumn,
          originalValue: value,
          newValue: value // Default to keeping the original value
        }));

        // Add these new mappings to our state, replacing any existing ones for this column
        setValueMapping((prev) => {
          // Remove any existing mappings for this column
          const filteredMappings = prev.filter((mapping) => mapping.column !== selectedColumn);
          // Add the new mappings
          return [...filteredMappings, ...initialMappings];
        });

        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      }
    });
  }, [file, selectedColumn, uniqueValues]);

  // Update parent component when mapping changes
  useEffect(() => {
    onValueMappingChange(valueMapping);
  }, [valueMapping, onValueMappingChange]);

  const handleValueMappingChange = (originalValue: string, newValue: string) => {
    setValueMapping((prev) =>
      prev.map((mapping) =>
        mapping.column === selectedColumn && mapping.originalValue === originalValue
          ? { ...mapping, newValue }
          : mapping
      )
    );
  };

  // Apply the value mappings to the CSV file
  const applyValueMappings = () => {
    if (!file || valueMapping.length === 0) {
      return;
    }

    setIsApplyingMapping(true);

    // Create a lookup object for faster access to mappings
    const mappingLookup: Record<string, Record<string, string>> = {};
    valueMapping.forEach((mapping) => {
      if (!mappingLookup[mapping.column]) {
        mappingLookup[mapping.column] = {};
      }
      mappingLookup[mapping.column][mapping.originalValue] = mapping.newValue;
    });

    // Parse the original CSV
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Apply mappings to each row
        const mappedData = (results.data as Record<string, any>[]).map((row) => {
          const newRow = { ...row };

          // Apply mappings for each column
          Object.keys(mappingLookup).forEach((column) => {
            if (newRow[column] !== undefined && mappingLookup[column][newRow[column]]) {
              newRow[column] = mappingLookup[column][newRow[column]];
            }
          });

          return newRow;
        });

        // Convert back to CSV
        const csv = Papa.unparse(mappedData);

        // Create a new file with the mapped values
        const mappedFileName = `mapped_${file.name}`;
        const mappedFile = new File([csv], mappedFileName, { type: 'text/csv' });

        // Call the onFileUpdate callback with the new file
        if (onFileUpdate) {
          onFileUpdate(mappedFile, mappedFileName);
        }

        setIsApplyingMapping(false);
      },
      error: () => {
        setIsApplyingMapping(false);
      }
    });
  };

  if (!file || columns.length === 0) {
    return <Box>Please upload a CSV file to see value mapping options</Box>;
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Rename Column Values
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a column and rename its values to standardize data. This is useful for normalizing categorical data.
        After mapping values, click the <strong>"Map Values"</strong> button at the bottom to apply your changes. The
        mapped file will automatically replace your current CSV file.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select a column to map values</InputLabel>
          <Select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            label="Select a column to map values">
            {columns.map((column) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {isLoading && <Typography>Loading values...</Typography>}

      {selectedColumn && uniqueValues[selectedColumn] && !isLoading && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Mapping for column: <strong>{selectedColumn}</strong>
          </Typography>

          <TableContainer component={Paper}>
            <Table aria-label="value mapping table">
              <TableHead>
                <TableRow>
                  <TableCell>Original Value</TableCell>
                  <TableCell>New Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(uniqueValues[selectedColumn]).map((originalValue) => {
                  const mapping = valueMapping.find(
                    (m) => m.column === selectedColumn && m.originalValue === originalValue
                  );

                  return (
                    <TableRow key={originalValue}>
                      <TableCell>{originalValue}</TableCell>
                      <TableCell>
                        {standardizedValues[selectedColumn] ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={mapping?.newValue || originalValue}
                              onChange={(e) => handleValueMappingChange(originalValue, e.target.value)}>
                              {standardizedValues[selectedColumn].map((stdValue) => (
                                <MenuItem key={stdValue} value={stdValue}>
                                  {stdValue}
                                </MenuItem>
                              ))}
                              <MenuItem value={originalValue}>
                                <em>Keep original: {originalValue}</em>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            size="small"
                            fullWidth
                            value={mapping?.newValue || originalValue}
                            onChange={(e) => handleValueMappingChange(originalValue, e.target.value)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {valueMapping.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={applyValueMappings} disabled={isApplyingMapping}>
            {isApplyingMapping ? 'Applying...' : 'Map Values'}
          </Button>
        </Box>
      )}
    </Box>
  );
};
