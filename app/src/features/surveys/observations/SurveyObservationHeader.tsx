import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export interface SurveyObservationHeaderProps {
  surveyName: string;
}

export const SurveyObservationHeader: React.FC<SurveyObservationHeaderProps> = (props) => {
  return (
    <>
      <Paper
        square
        sx={{
          pt: 3,
          pb: 3.5,
          px: 3
        }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 1,
            fontSize: '14px'
          }}>
          <Link underline="hover" href="#">
            {props.surveyName}
          </Link>
          <Typography color="text.secondary" variant="body2">
            Manage Survey Observations
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            ml: '-2px'
          }}>
          Manage Survey Observations
        </Typography>
      </Paper>

      {/* <AppBar
        position="relative"
        elevation={1}
        sx={{
          flex: '0 0 auto'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            sx={{
              mr: 2
            }}
          >
            <Icon path={mdiArrowLeft} size={1}></Icon>
          </IconButton>
          <Typography component="h1" variant="h4">Manage Observations Prototype</Typography>
        </Toolbar>
      </AppBar> */}
    </>
  );
};
