import Box from '@mui/material/Box';
import { blue } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useCodesContext } from 'hooks/useContext';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';
import { getCodesName } from 'utils/Utils';
import AccordionCard from './AccordionCard';

interface ISamplingTechniqueCardProps {
  technique: IGetTechnique;
  method_lookup_name: string;
  handleMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const SamplingTechniqueCard = (props: ISamplingTechniqueCardProps) => {
  const { technique, method_lookup_name, handleMenuClick } = props;

  const codesContext = useCodesContext();

  const attributes = [...technique.qualitative_attributes, ...technique.qualitative_attributes];

  return (
    <AccordionCard
      summaryContent={
        <Stack gap={0.5} display="flex">
          <Stack direction="row" gap={1}>
            <Typography variant="h5">{technique.name}</Typography>
            <ColouredRectangleChip
              colour={blue}
              label={
                getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? ''
              }
            />
          </Stack>
          <Typography color="textSecondary">{method_lookup_name}</Typography>
        </Stack>
      }
      detailsContent={
        <Stack gap={3} sx={{ '& .MuiTypography-body2': { fontSize: '0.9rem' } }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography
                color="textSecondary"
                fontWeight={700}
                fontSize="0.75rem"
                sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                Release time
              </Typography>
            </Box>
          </Stack>

          {technique.description && (
            <Box maxWidth="50%">
              <Typography
                color="textSecondary"
                fontWeight={700}
                fontSize="0.75rem"
                sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                Technique comment
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {technique.description}
              </Typography>
            </Box>
          )}

          {attributes.map((attribute) => (
            <Typography>{attribute.method_technique_attribute_qualitative_id}</Typography>
          ))}
        </Stack>
      }
      onMenuClick={handleMenuClick}
    />
  );
};

export default SamplingTechniqueCard;