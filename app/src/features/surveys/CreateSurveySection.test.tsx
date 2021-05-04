import { render } from '@testing-library/react';
import CreateSurveySection from './CreateSurveySection';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

describe('Create Survey Section', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <CreateSurveySection
        title="Section title"
        summary="Section summary"
        component={
          <Box>
            <Typography>Hey this is my content</Typography>
          </Box>
        }
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
