import { AxiosProgressEvent } from 'axios';
import Papa from 'papaparse';

///Tech Debt. This file does not have the functinalty for splitting collumns into multiple columns. For example, Bull imples life stage and sex, yet this is not implemented in the code.

// Define interfaces for the transformation options
export interface WideToTallOptions {
  valueVars: string[];
  excludeColumns: string[];
  variableColumnName: string;
}

// Interface for the transformation result
export interface TransformResult {
  csv: string;
  filename: string;
  blob: Blob;
}

/**
 * Transforms wide format CSV data to tall format.
 *
 * @param {File} file - The CSV file to transform
 * @param {WideToTallOptions} options - Configuration options for the transformation
 * @param {(progressEvent: AxiosProgressEvent) => void} onProgress - Callback to track progress
 * @return {Promise<TransformResult>} Promise that resolves with the transformation result
 */
export const wideToTall = async (
  file: File,
  options: WideToTallOptions,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<TransformResult> => {
  return new Promise((resolve, reject) => {
    try {
      // Initialize progress
      if (onProgress) {
        onProgress({ loaded: 0, total: 100 } as AxiosProgressEvent);
      }

      // Parse the CSV file
      Papa.parse<Record<string, any>>(file, {
        header: true,
        dynamicTyping: true,
        complete: (results: Papa.ParseResult<Record<string, any>>) => {
          try {
            // Update progress after parsing
            if (onProgress) {
              onProgress({ loaded: 25, total: 100 } as AxiosProgressEvent);
            }

            const data = results.data as Record<string, any>[];
            const columns = Object.keys(data[0] || {});

            // Calculate ID vars (columns that won't be transformed)
            const idVars = columns.filter(
              (col) => !options.valueVars.includes(col) && !options.excludeColumns.includes(col)
            );

            // Filter out excluded columns from value_vars
            const filteredValueVars = options.valueVars.filter((col) => !options.excludeColumns.includes(col));

            // Update progress before transformation
            if (onProgress) {
              onProgress({ loaded: 50, total: 100 } as AxiosProgressEvent);
            }

            // Transform the data from wide to tall format (similar to pandas melt)
            const meltedData: Record<string, any>[] = [];

            data.forEach((row) => {
              filteredValueVars.forEach((valueVar) => {
                const value = row[valueVar];

                // Skip null or undefined values
                if (value == null) {
                  return;
                }

                const newRow: Record<string, any> = {};

                // Add ID variables
                idVars.forEach((idVar) => {
                  newRow[idVar] = row[idVar];
                });

                // Add variable and value columns
                newRow[options.variableColumnName] = valueVar;
                newRow['Count'] = value;

                meltedData.push(newRow);
              });
            });

            // Update progress after transformation
            if (onProgress) {
              onProgress({ loaded: 75, total: 100 } as AxiosProgressEvent);
            }

            // Convert the transformed data back to CSV
            const csv = Papa.unparse(meltedData);

            // Create a Blob for the CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const filename = `${file.name.replace('.csv', '')}_melted.csv`;

            // Complete progress
            if (onProgress) {
              onProgress({ loaded: 100, total: 100 } as AxiosProgressEvent);
            }

            console.log('Wide to tall transformation completed for file:', file.name);
            resolve({ csv, filename, blob });
          } catch (error) {
            console.error('Error during transformation:', error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in wide to tall transformation:', error);
      reject(error);
    }
  });
};
