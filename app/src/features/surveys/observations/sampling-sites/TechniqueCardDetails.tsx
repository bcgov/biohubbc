import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';

interface ITechniqueCardDetails {
  technique: IGetTechnique;
}

/**
 * Details displayed with the accordion component displaying an animal technique
 *
 * @param {ITechniqueCardDetails} props
 * @return {*}
 */
export const TechniqueCardDetails = (props: ITechniqueCardDetails) => {
  const { technique } = props;

  const attributes = [...technique.qualitative_attributes, ...technique.qualitative_attributes];

  return (
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

      {attributes.map((attribute) => <Typography>{attribute.method_technique_attribute_qualitative_id}</Typography>)}
    </Stack>
  );
};
