import { Box, Container } from '@material-ui/core';
import FormContainer from 'components/form/FormContainer';
import { IActivity } from 'interfaces/useBioHubApi-interfaces';
import React from 'react';

const HomePage = () => {
  const testActivity: IActivity = {
    activity_id: '1',
    tags: ['animal', 'terrestrial'],
    template_id: '1',
    form_data: {}
  };

  return (
    <Box my={3}>
      <Container>
        <FormContainer activity={testActivity} />
      </Container>
    </Box>
  );
};

export default HomePage;
