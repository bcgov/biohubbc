import { LoadingButton } from '@mui/lab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export interface ISamplingSiteHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
  project_name: string;
  is_submitting: boolean;
  title: string;
  breadcrumb: string;
}

/**
 * Renders the header of the Sampling Site page.
 *
 * @param {*} props
 * @return {*}
 */
export const SamplingSiteHeader: React.FC<ISamplingSiteHeaderProps> = (props) => {
  const history = useHistory();
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

  const { project_id, survey_id, survey_name, project_name, is_submitting, title, breadcrumb } = props;

  return (
    <>
      <Paper
        square
        elevation={1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1002,
          borderBottom: '1px solid' + grey[300]
        }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator=">"
            sx={{
              typography: 'body2'
            }}>
            <Link component={RouterLink} to={`/admin/projects/${project_id}/details`} underline="none">
              {project_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}
              underline="none">
              {survey_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${project_id}/surveys/${survey_id}/observations`}
              underline="none">
              Manage Survey Observations
            </Link>
            <Typography component="span" variant="body2" color="textSecondary">
              {breadcrumb}
            </Typography>
          </Breadcrumbs>
          <Stack
            alignItems="flex-start"
            flexDirection={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            gap={3}>
            <Typography variant="h1" sx={{ ml: '-2px' }}>
              {title}
            </Typography>
            <Stack flexDirection="row" alignItems="center" gap={1}>
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
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </>
  );
};

export default SamplingSiteHeader;
