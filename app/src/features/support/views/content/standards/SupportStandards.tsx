import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';

export const SupportStandards = () => {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Data Standards
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography paragraph>
        Data standards ensure consistent formatting and organization of information, enabling seamless collaboration and
        integration across projects. By following these standards, you can increase the quality and consistency of your data and enable impactful insights.
      </Typography>
      <Typography paragraph>
        The standards page provides detailed guidance on required formats, taxonomy standards, and best practices for
        data submission. These standards are designed to balance standardization with flexibility, addressing the
        diverse needs of ecological research.
      </Typography>

      <Stack gap={2} mt={3}>
        <AccordionStandardCard
          label="What are data standards and how do they benefit you"
          subtitle="Data standards ensure consistent formatting and organization of information, enabling seamless collaboration and integration across projects. The standards page guides users on required formats for data submission."
          colour={grey[100]}
        />
        <AccordionStandardCard
          label="ITIS"
          subtitle="The Integrated Taxonomic Information System (ITIS) provides a standardized taxonomy for species. Use ITIS to verify species names and ensure accurate data entry in SIMS."
          colour={grey[100]}
        />
        <AccordionStandardCard
          label="How to use our standards page"
          subtitle="The standards page provides guidance on formatting your data to align with established protocols. Use it to find details on required variables, acceptable formats, and taxonomy standards, ensuring your data meets submission requirements."
          colour={grey[100]}
        />
        <AccordionStandardCard
          label="FAQ - I cannot find my species"
          subtitle="Visit the ITIS website and search for the species name. It may be listed under a different accepted name or synonym in the taxonomy database."
          colour={grey[100]}
        />
        <AccordionStandardCard
          label="FAQ - I cannot find a measurement, body location, marking, or environmental variable"
          subtitle="Contact support to request its addition."
          colour={grey[100]}
        />
        <AccordionStandardCard
          label="FAQ - How were these standards decided on?"
          subtitle="The data standards were developed using SPI templates, input from biologists, and ongoing feedback from SIMS users to balance standardization with flexibility for various ecological needs."
          colour={grey[100]}
        />
      </Stack>
    </Box>
  );
};
