import { Box, Grid } from '@mui/material';
import { QuestionAnswer } from './components/QuestionAnswer';

export const LandingIntro = () => {
  return (
    <Grid container spacing={5} justifyContent="space-between" mb={5}>
      <Grid item xs={10} md={6}>
        <QuestionAnswer
          title="What is the Species Inventory Management System?"
          subtext={
            <>
              A space to manage fish and wildlife data with collaborators from multiple organizations. Upload species
              observations, animal telemetry, and animal captures, among other information, and invite collaborators to
              do the same in a shared workspace.
            </>
          }
        />
      </Grid>
      <Grid item xs={10} md={6}>
        <QuestionAnswer
          title="Who can gain access?"
          subtext={
            <>
              Staff, contractors, and partners of the Province who collect and manage fish and wildlife data. You must
              have an IDIR or <a href="https://www.bceid.ca/">BCeID</a> to log in.
            </>
          }
        />
      </Grid>
      <Grid item xs={10} md={6}>
        <QuestionAnswer
          title="What's the benefit?"
          subtext={
            <>
              Simple screens let teams organize and manage ecological survey information in an intuitive way. Keep track
              of where, when, and how you surveyed, along with your findings, in a shared workspace that is private to
              your team.
            </>
          }
        />
      </Grid>
      <Grid item xs={10} md={6}>
        <QuestionAnswer
          title="How can I get started?"
          subtext={
            <>
              Request access to the Species Inventory Management System using an IDIR or BCeID. If you have neither
              credential, you can request a Basic BCeID from <a href="https://www.bceid.ca/">bceid.ca</a>. After gaining
              access, create a new Project or ask your team to invite you to an existing Project.
            </>
          }
        />
      </Grid>

      <Grid item xs={12} mt={5}>
        <Box maxWidth="100%" component="img" src="/assets/manage-observations.jpg" />
      </Grid>
    </Grid>
  );
};
