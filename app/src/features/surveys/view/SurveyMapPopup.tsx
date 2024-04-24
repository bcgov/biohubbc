import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ISurveyMapPointMetadata } from './SurveyMap';

interface ISurveyMapPopupProps {
  isLoading: boolean;
  title: string;
  metadata: ISurveyMapPointMetadata[];
}

/**
 * Returns a popup component for displaying information about a leaflet map layer upon being clicked
 *
 * @param props {ISurveyMapPopupProps}
 * @returns
 */
const SurveyMapPopup = (props: ISurveyMapPopupProps) => {
  return (
    <Box>
      {props.isLoading ? (
        <Box position="absolute" top="0" left="0" right="0" sx={{ opacity: 1 }}>
          <Typography
            component="div"
            variant="body2"
            fontWeight={700}
            sx={{
              pr: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
            <Skeleton />
          </Typography>
          <Box mt={1} mb={0}>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="80px" />
              <Skeleton sx={{ flex: '1 1 auto' }} />
            </Stack>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="80px" />
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
            {props.title}
          </Typography>
          <Box component="dl" mt={1} mb={0}>
            {props.metadata.map((metadata) => (
              <Stack
                key={`${metadata.label}-${metadata.value}`}
                flexDirection="row"
                alignItems="flex-start"
                gap={1}
                sx={{ typography: 'body2' }}>
                <Box component="dt" width={80} flex="0 0 auto" sx={{ color: 'text.secondary' }}>
                  {metadata.label}:
                </Box>
                <Box component="dd" m={0} minWidth={100}>
                  {metadata.value}
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SurveyMapPopup;
