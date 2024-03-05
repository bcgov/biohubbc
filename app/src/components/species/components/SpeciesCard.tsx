import { mdiCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Chip, colors, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

interface ISpeciesCard {
  commonNames: string[];
  scientificName: string;
  tsn: number;
  rank: string;
  kingdom: string;
}

const SpeciesCard = (props: ISpeciesCard) => {
  const rankColors = [
    { color: colors.blue[600], ranks: ['Subspecies', 'Variety'] },
    { color: colors.purple[600], ranks: ['Species'] },
    { color: colors.teal[600], ranks: ['Genus'] },
    { color: colors.blue[600], ranks: ['Family'] },
    { color: colors.indigo[600], ranks: ['Order'] },
    { color: colors.deepOrange[600], ranks: ['Class'] },
    { color: colors.pink[600], ranks: ['Phylum'] },
    { color: colors.grey[600], ranks: ['Kingdom'] }
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
          {props.rank && (
            <Chip
              title="Taxonomic rank"
              label={props.rank}
              size="small"
              sx={{
                minWidth: '0.4rem',
                padding: '0.8px 0.8px',
                margin: '0 10px 3px 10px',
                opacity: 0.6,
                backgroundColor: rankColors.find((color) => color.ranks.includes(props.rank))?.color || grey[800],
                '& .MuiChip-label': {
                  letterSpacing: '0.03rem',
                  color: '#fff',
                  fontWeight: 100,
                  fontSize: '0.6rem'
                }
              }}
            />
          )}
        </Typography>
        <Stack direction="row" alignItems='center'>
          {props.commonNames?.length > 0 &&
            props.commonNames.map((name, index) => (
              <React.Fragment key={`${name}-${index}`}>
                {index > 0 && <Icon path={mdiCircle} size={0.15} color={grey[500]} style={{ margin: '0 5px' }} />}
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    textTransform: 'capitalize'
                  }}>
                  {name}
                </Typography>
              </React.Fragment>
            ))}
        </Stack>
      </Typography>
      <Stack spacing={1} direction="row">
        <Chip
          title="Taxonomic serial number (ID)"
          label={'ID: ' + props.tsn}
          size="small"
          sx={{
            '& .MuiChip-label': {
              letterSpacing: '0.03rem'
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

export default SpeciesCard;
