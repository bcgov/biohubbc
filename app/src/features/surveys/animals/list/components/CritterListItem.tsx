import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import ScientificNameTypography from '../../profile/ScientificNameTypography';

interface ICritterListItemProps {
  critter: ISimpleCritterWithInternalId;
  isChecked: boolean;
  handleCheckboxChange: (surveyCritterId: number) => void;
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
      sx={{
        flex: '1 1 auto',
      }}>
      <IconButton
        onClick={() => {
          // Avoid unnecessary reloads
          if (critter.survey_critter_id !== selectedAnimal?.survey_critter_id)
            setSelectedAnimal({
              survey_critter_id: critter.survey_critter_id,
              critterbase_critter_id: critter.critter_id
            });
        }}
        sx={{
          borderRadius: 0,
          flex: '1 1 auto',
          justifyContent: 'flex-start',
          '&:focus': {
            outline: 'none'
          },
          '& .MuiTypography-root': {
            color: 'text.primary'
          },
          bgcolor: selectedAnimal?.survey_critter_id === critter.survey_critter_id ? grey[100] : undefined
        }}>
        <Stack
          flexDirection="row"
          alignItems="flex-start"
          sx={{
            px: 1.25,
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
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              textAlign: 'left',
              flex: '0.7',
              mt: 1
            }}>
            <Typography
              component="span"
              textAlign="left"
              variant="body2"
              sx={{
                mr: 1,
                fontWeight: 700,
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                textAlign: 'left',
                flex: '1 1 auto'
              }}>
              {critter.animal_id}
            </Typography>
            <ScientificNameTypography
              component="span"
              name={critter.itis_scientific_name}
              sx={{
                color: `${grey[600]} !important`,
                flex: '1 1 auto'
              }}
            />
          </Typography>
        </Stack>
      </IconButton>
    </Stack>
  );
};

export default CritterListItem;
