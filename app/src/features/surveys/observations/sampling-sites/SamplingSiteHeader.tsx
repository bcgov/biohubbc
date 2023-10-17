import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { ICreateSamplingSiteRequest } from './SamplingSitePage';

export interface ISamplingSiteHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
  is_submitting: boolean;
  title: string;
  breadcrumb: string;
}
export const SamplingSiteHeader: React.FC<ISamplingSiteHeaderProps> = (props) => {
  const history = useHistory();
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

  const { project_id, survey_id, survey_name, is_submitting, title, breadcrumb } = props;
  return (
    <>
      <Paper
        square
        elevation={0}
        sx={{
          py: 3
        }}>
        <Container maxWidth="xl">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component={RouterLink}
              to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}
              underline="none">
              <Typography component="span" variant="body2">
                {survey_name}
              </Typography>
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${project_id}/surveys/${survey_id}/observations`}
              underline="none">
              <Typography component="span" variant="body2">
                Manage Survey Observations
              </Typography>
            </Link>
            <Typography component="span" color="text.secondary" variant="body2">
              {breadcrumb}
            </Typography>
          </Breadcrumbs>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography
              variant="h3"
              component="h1"
              sx={{
                ml: '-2px'
              }}>
              {title}
            </Typography>
            <Box
              sx={{
                '& button': {
                  minWidth: '6rem',
                },
                '& button + button': {
                  ml: 1
                }
              }}
            >
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={is_submitting}
                onClick={() => {
                  formikProps.submitForm();
                }}>
                Save and Exit
              </LoadingButton>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  history.push(`/admin/projects/${project_id}/surveys/${survey_id}/observations`);
                }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>
    </>
  );
};

export default SamplingSiteHeader;
