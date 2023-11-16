import { mdiContentCopy, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { DialogContext } from 'contexts/dialogContext';
import { useFormikContext } from 'formik';
import { useContext } from 'react';
import { setMessageSnackbar } from 'utils/Utils';
import { DetailsWrapper } from '../SurveyDetails';
import { IAnimal } from './animal';

interface IGeneralDetail {
  title: string;
  value?: string;
  valueEndIcon?: JSX.Element;
}

interface GeneralAnimalSummaryProps {
  /*
   * Callback to be fired when edit action selected
   */
  handleEdit: () => void;
}

const GeneralAnimalSummary = (props: GeneralAnimalSummaryProps) => {
  const dialogContext = useContext(DialogContext);

  const {
    initialValues: { general }
  } = useFormikContext<IAnimal>();

  const animalGeneralDetails: Array<IGeneralDetail> = [
    { title: 'Alias', value: general.animal_id },
    { title: 'Taxon', value: general.taxon_name },
    { title: 'Sex', value: general.sex },
    { title: 'Wildlife Health ID', value: general.wlh_id },
    {
      title: 'Critterbase ID',
      value: general.critter_id,
      valueEndIcon: (
        <IconButton
          sx={{ ml: 0.5 }}
          aria-label={`Copy Critter ID`}
          onClick={() => {
            navigator.clipboard.writeText(general.critter_id ?? '');
            setMessageSnackbar('Copied Critter ID', dialogContext);
          }}>
          <Icon path={mdiContentCopy} size={0.8} />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Paper>
        <Toolbar>
          <Typography variant="h4" component="h2" sx={{ flex: '1 1 auto' }}>
            Animal Summary
          </Typography>
          <IconButton onClick={props.handleEdit} aria-label="Edit Animal Details">
            <Icon path={mdiPencilOutline} size={1} />
          </IconButton>
        </Toolbar>
        <Divider sx={{ m: 0 }}></Divider>
        <DetailsWrapper>
          <Box component="section">
            <Typography component="h3">Details</Typography>
            <Box component="dl">
              {animalGeneralDetails.map((details) =>
                details.value !== undefined ? (
                  <Box className="row" key={details.title}>
                    <Typography component="dt">{details.title}</Typography>
                    <Typography component="dd" display="flex" alignItems="center">
                      {details.value}
                      {details.valueEndIcon}
                    </Typography>
                  </Box>
                ) : null
              )}
            </Box>
          </Box>
        </DetailsWrapper>
      </Paper>
    </Box>
  );
};

export default GeneralAnimalSummary;
