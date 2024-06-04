import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';
import AccordionCard from './AccordionCard';

interface ISamplingSiteCardProps {
  sampleSite: IGetSampleLocationDetails;
  handleMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isChecked?: boolean;
  handleCheckboxChange?: (sampleSiteId: number) => void;
}

const SamplingSiteCard = (props: ISamplingSiteCardProps) => {
  const { sampleSite, handleMenuClick, handleCheckboxChange, isChecked } = props;

  return (
    <AccordionCard
      summaryContent={
        <Stack gap={0.5} display="flex">
          <Stack direction="row" alignItems="center">
            {handleCheckboxChange && (
              <Box flex="0 0 auto" display="flex" alignItems="center" zIndex={100} position="absolute">
                <Checkbox
                  edge="start"
                  checked={isChecked}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCheckboxChange(sampleSite.survey_sample_site_id);
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Box>
            )}
            <Typography ml={4} variant="h5">
              {sampleSite.name}
            </Typography>
          </Stack>
          <Typography ml={4} color="textSecondary">
            {sampleSite.description}
          </Typography>
        </Stack>
      }
      detailsContent={
        <Stack gap={0.5} display="flex" ml={4}>
          <Typography variant="h5">{sampleSite.description}</Typography>
          <Typography color="textSecondary">{sampleSite.name}</Typography>
        </Stack>
      }
      onMenuClick={handleMenuClick}
    />
  );
};

export default SamplingSiteCard;
