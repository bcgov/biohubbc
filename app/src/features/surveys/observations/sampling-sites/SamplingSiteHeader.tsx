import { Breadcrumbs, Link, Paper, Typography } from '@mui/material';

export interface ISamplingSiteHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
}
export const SamplingSiteHeader: React.FC<ISamplingSiteHeaderProps> = (props) => {
  const { project_id, survey_id, survey_name } = props;
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
          <Link underline="hover" href={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
            {survey_name}
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href={`/admin/projects/${project_id}/surveys/${survey_id}/observations`}>
            Manage Survey Observations
          </Link>
          <Typography color="text.secondary" variant="body2">
            New Sampling Site
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            ml: '-2px'
          }}>
          New Sampling Site
        </Typography>
      </Paper>
    </>
  );
};

export default SamplingSiteHeader;
