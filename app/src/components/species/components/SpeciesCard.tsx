import { mdiCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Chip, colors, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';

interface ISpeciesCard {
  commonNames: string[];
  scientificName: string;
  tsn: number;
  rank: string;
}

const SpeciesCard = (props: ISpeciesCard) => {
  const rankColors = [
    { color: colors.blue[400], ranks: ['Subspecies', 'Variety'] },
    { color: colors.purple[400], ranks: ['Species'] },
    { color: colors.green[400], ranks: ['Genus'] },
    { color: colors.blue[400], ranks: ['Family'] },
    { color: colors.red[400], ranks: ['Order'] },
    { color: colors.orange[400], ranks: ['Class'] },
    { color: colors.pink[400], ranks: ['Phylum'] },
    { color: colors.grey[400], ranks: ['Kingdom'] }
  ];

  return (
    <Stack flexDirection="row" justifyContent="space-between" width="100%">
      <Typography component="span" variant="body1">
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
          {props.scientificName.split(' ').length > 1 ? <em>{props.scientificName}</em> : <>{props.scientificName}</>}
          <Chip
            title="Taxonomic rank"
            label={props.rank}
            size="small"
            sx={{
              minWidth: '0.4rem',
              borderRadius: '4px',
              padding: '1px 1px',
              margin: '0 10px 3px 10px',
              opacity: 0.4,
              backgroundColor: rankColors.find((color) => color.ranks.includes(props.rank))?.color || grey[800],
              '& .MuiChip-label': {
                pt: '2px',
                letterSpacing: '0.03rem',
                color: '#fff',
                fontWeight: 100,
                fontSize: '0.7rem'
              }
            }}
          />
        </Typography>
        <Box display="flex" alignItems="center">
          {props.commonNames?.length > 0 &&
            props.commonNames.map((name, index) => (
              <>
                {index > 0 && <Icon path={mdiCircle} size={0.15} color={grey[500]} style={{ margin: '0 5px' }} />}
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    textTransform: 'capitalize'
                  }}>
                  {name}
                </Typography>
              </>
            ))}
        </Box>
      </Typography>
      <Stack spacing={1} direction="row">
        <Chip
          title="Taxonomic serial number (ID)"
          label={'ID: ' + props.tsn}
          size="small"
          sx={{
            backgroundColor: grey[700],
            '& .MuiChip-label': {
              color: '#fff',
              mt: '1px',
              letterSpacing: '0.03rem'
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

export default SpeciesCard;
