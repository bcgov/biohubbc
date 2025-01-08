import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { useMemo } from 'react';
import { CSVError } from 'utils/csv-utils';
import { v4 } from 'uuid';

interface CSVErrorsProps {
  errors: CSVError[];
}

/**
 * Returns a stack of CSV errors with information about solutions
 *
 * @param {CSVErrorsProps} props
 * @returns {*}
 */
export const CSVErrors = (props: CSVErrorsProps) => {
  const rows: (CSVError & { id: string })[] = useMemo(() => {
    return props.errors.map((error) => {
      return {
        id: v4(),
        ...error
      };
    });
  }, [props.errors]);

  return (
    <Stack gap={1}>
      {rows.map((error) => {
        return (
          <AlertBar
            key={error.id}
            severity="error"
            variant="standard"
            title={error.error}
            text={
              <Stack gap={1}>
                <Typography variant="body2">{error.solution}</Typography>
                <Stack gap={3} flexDirection="row">
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      Row
                    </Typography>
                    <Typography variant="body2">{error.row}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      Column
                    </Typography>
                    <Typography variant="body2">{error.header}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      Value
                    </Typography>
                    <Typography variant="body2">{error.cell}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            }
          />
        );
      })}
    </Stack>
  );
};
