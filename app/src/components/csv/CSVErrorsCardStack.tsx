import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { useMemo, useState } from 'react';
import { CSVError } from 'utils/csv-utils';
import { v4 } from 'uuid';

const MAX_ERRORS_SHOWN = 10;

interface CSVErrorsCardStackProps {
  errors: CSVError[];
}

/**
 * Returns a stack of CSV errors with information about solutions and pagination
 *
 * @param {CSVErrorsCardStackProps} props
 * @returns {*}
 */
export const CSVErrorsCardStack = (props: CSVErrorsCardStackProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pageCount = Math.ceil(props.errors.length / MAX_ERRORS_SHOWN);

  const rows: (CSVError & { id: string })[] = useMemo(() => {
    return props.errors.slice(currentPage * MAX_ERRORS_SHOWN, (currentPage + 1) * MAX_ERRORS_SHOWN).map((error) => {
      return {
        id: v4(),
        ...error
      };
    });
  }, [props.errors, currentPage]);

  const handleNextPage = () => {
    if ((currentPage + 1) * MAX_ERRORS_SHOWN < props.errors.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

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
                    <Typography variant="body2">{error.row ?? 'N/A'}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      Column
                    </Typography>
                    <Typography variant="body2">{error.header ?? 'N/A'}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      Cell
                    </Typography>
                    <Typography variant="body2">{error.cell ?? 'N/A'}</Typography>
                  </Stack>
                  {(error.cell || error.header) && error.values && (
                    <Stack>
                      <Typography variant="body2" fontWeight={700}>
                        Allowed Values
                      </Typography>
                      <Typography variant="body2">{error.values.join(', ')}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            }
          />
        );
      })}
      {props.errors.length > MAX_ERRORS_SHOWN && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <IconButton onClick={handlePreviousPage} disabled={!currentPage}>
            <Icon path={mdiChevronLeft} size={1} />
          </IconButton>
          <Typography variant="body2">
            Page {currentPage + 1} of {pageCount}
          </Typography>
          <IconButton onClick={handleNextPage} disabled={currentPage + 1 === pageCount}>
            <Icon path={mdiChevronRight} size={1} />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
};
