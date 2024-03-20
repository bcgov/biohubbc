import { Chip, Stack, Typography } from '@mui/material';

interface ISpeciesCard {
  commonName: string | null;
  scientificName: string;
  tsn: number;
}

const SpeciesCard = (props: ISpeciesCard) => {
  return (
    <Stack flexDirection="row" justifyContent="space-between" width="100%">
      <Typography component="span" variant="body1">
        {props.commonName ? (
          <>
            <Typography
              component="strong"
              sx={{
                display: 'inline-block',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                '&::first-letter': {
                  textTransform: 'capitalize'
                }
              }}>
              {props.commonName}
            </Typography>
            &nbsp;(<em>{props.scientificName}</em>)
          </>
        ) : (
          <em>{props.scientificName}</em>
        )}
      </Typography>
      <Chip
        title="Taxonomic serial number"
        label={'TSN:' + props.tsn}
        size="small"
        sx={{
          '& .MuiChip-label': {
            mt: '1px',
            letterSpacing: '0.03rem'
          }
        }}></Chip>
    </Stack>
  );
};

export default SpeciesCard;
