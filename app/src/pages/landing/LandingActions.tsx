import Grid from '@mui/material/Grid';
import LandingActionCard from './components/LandingActionCard';

const LandingActions = () => {
  return (
    <Grid container spacing={6} mt={0}>
      <Grid item xs={12} sm={6} md={4}>
        <LandingActionCard
          title="Projects"
          subtext="Learn about Projects and how they let your team collaborate"
          to="admin/projects"
          bgcolor="#87acc4"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <LandingActionCard
          title="Data Standards"
          subtext="Learn about data standards and best practices for managing ecological data"
          to="standards"
          bgcolor="#7e99c4"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <LandingActionCard
          title="Tutorials"
          subtext="Learn how to use the Species Inventory Management System"
          to="standards"
          bgcolor="#a8d3e0"
        />
      </Grid>
    </Grid>
  );
};

export default LandingActions;
