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
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export interface IDeploymentFormHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
  is_submitting: boolean;
  title: string;
  breadcrumb: string;
}

/**
 * Renders the header of the create and edit deployment pages.
 *
 * @param {IDeploymentFormHeaderProps} props
 * @return {*}
 */
export const DeploymentFormHeader = (props: IDeploymentFormHeaderProps) => {
  const history = useHistory();
  const formikProps = useFormikContext<ICreateAnimalDeployment>();

  const { project_id, survey_id, survey_name, project_name, is_submitting, title, breadcrumb } = props;

  return (
    <>
      <Paper
        square
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
            <Link component={RouterLink} to={`/admin/projects/${project_id}`} underline="none">
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
              to={`/admin/projects/${project_id}/surveys/${survey_id}/telemetry`}
              underline="none">
              Manage Telemetry
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
                  history.push(`/admin/projects/${project_id}/surveys/${survey_id}/telemetry`);
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
