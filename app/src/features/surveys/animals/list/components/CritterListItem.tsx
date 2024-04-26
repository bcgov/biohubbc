import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React from 'react';

interface ICritterListItemProps {
  critter: ISimpleCritterWithInternalId;
  isChecked: boolean;
  handleCritterMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, critter: ISurveyCritter) => void;
  handleCheckboxChange: (sampleSiteId: number) => void;
}

const CritterListItem = (props: ICritterListItemProps) => {
  const surveyContext = useSurveyContext();
  const critters = surveyContext.critterDataLoader.data;
  const { critter, isChecked, handleCheckboxChange } = props;

  const { selectedAnimal, setSelectedAnimal } = useAnimalPageContext();

  const { projectId, surveyId } = surveyContext;

  if (!critters) {
    surveyContext.critterDataLoader.load(projectId, surveyId);
    return <CircularProgress size={40} />;
  }

  if (!critters.length) {
    return <CircularProgress size={40} />;
  }

  return (
    <Stack
      spacing={1}
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        px: 1,
        m: 0,
        py: 0.5,
        background: '#fff',
        borderBottom: '1px solid' + grey[200],
        '&:before': {
          display: 'none'
        }
      }}>
      <IconButton
        onClick={() => {
          setSelectedAnimal({
            survey_critter_id: critter.survey_critter_id,
            critterbase_critter_id: critter.critter_id
          });
        }}
        sx={{
          borderRadius: '5px',
          py: 0.5,
          flex: '1 1 auto',
          justifyContent: 'flex-start',
          '&:focus': {
            outline: 'none'
          },
          '& .MuiTypography-root': {
            color: 'text.primary'
          },
          bgcolor: selectedAnimal?.survey_critter_id === critter.survey_critter_id ? grey[200] : undefined
        }}>
        <Stack
          flexDirection="row"
          alignItems="center"
          sx={{
            gap: 0.25,
            px: 1,
            flex: '1 1 auto'
          }}>
          <Checkbox
            sx={{ mr: 0.5 }}
            edge="start"
            checked={isChecked}
            onClick={(event) => {
              event.stopPropagation();
              handleCheckboxChange(critter.survey_critter_id);
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Typography
            textAlign="left"
            variant="body2"
            sx={{
              flex: '1 1 auto',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
            {critter.animal_id}
          </Typography>
        </Stack>
      </IconButton>
    </Stack>
  );
};

export default CritterListItem;
