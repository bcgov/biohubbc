import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

export interface ISurveyMapPopupProps {
  isLoading: boolean;
  title: string;
  metadata: {
    label: string;
    value: string | number | null | ReactNode;
  }[];
  actionButtonLabel?: string;
  handleActionButtonClick?: () => void;
}

/**
 * Returns a popup component for displaying information about a leaflet map layer upon being clicked
 *
 * @param {ISurveyMapPopupProps} props
 * @return {*}
 */
export const SurveyMapPopup = (props: ISurveyMapPopupProps) => {
  const { isLoading, title, metadata, actionButtonLabel, handleActionButtonClick } = props;

  return (
    <Box>
      {isLoading ? (
        <Box>
          <Typography
            component="div"
            variant="body2"
            fontWeight={700}
            sx={{
              pr: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase'
            }}>
            <Skeleton />
          </Typography>
          <Box mt={1} mb={0} width={200}>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="100px" />
              <Skeleton sx={{ flex: '1 1 auto' }} />
            </Stack>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="100px" />
              <Skeleton sx={{ flex: '1 1 auto' }} />
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography
            component="div"
            variant="body2"
            fontWeight={700}
            sx={{
              pr: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase'
            }}>
            {title}
          </Typography>
          <Stack gap={1} component="dl" mt={1} mb={0}>
            {metadata.map((metadata) => (
              <Stack
                key={`${metadata.label}-${metadata.value}`}
                flexDirection="row"
                alignItems="flex-start"
                gap={1}
                sx={{ typography: 'body2' }}>
                <Box component="dt" minWidth={100} flex="0 0 auto" sx={{ color: 'text.secondary' }}>
                  {metadata.label}:
                </Box>
                <Box component="dd" m={0} minWidth={100}>
                  {metadata.value}
                </Box>
              </Stack>
            ))}
          </Stack>
          {handleActionButtonClick && (
            <Box mt={2}>
              <Button fullWidth onClick={handleActionButtonClick} variant="contained">
                {actionButtonLabel}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
