import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { AccordionCard } from 'components/accordion/AccordionCard';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';

interface ISamplingSiteCardProps {
  sampleSite: IGetSampleLocationDetails;
  handleMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isChecked?: boolean;
  handleCheckboxChange?: (sampleSiteId: number) => void;
}

const SamplingSiteCard = (props: ISamplingSiteCardProps) => {
  const { sampleSite, handleMenuClick, isChecked, handleCheckboxChange } = props;

  return (
    <AccordionCard
      summaryContent={
        <Box display="flex" alignItems="center">
          {handleCheckboxChange && (
            <Checkbox
              sx={{ position: 'absolute' }}
              edge="start"
              checked={isChecked}
              onClick={(event) => {
                event.stopPropagation();
                handleCheckboxChange(sampleSite.survey_sample_site_id);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          )}
          <Typography ml={handleCheckboxChange ? 6 : 0} variant="h5">
            {sampleSite.name}
          </Typography>
        </Box>
      }
      detailsContent={
        <Box ml={handleCheckboxChange ? 6 : 0} display="flex" flexDirection="column">
          <Typography variant="h5">{sampleSite.description}</Typography>
          <Typography color="textSecondary">{sampleSite.name}</Typography>
        </Box>
      }
      onMenuClick={handleMenuClick}
    />
  );
};

export default SamplingSiteCard;
