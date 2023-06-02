import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { render } from 'test-helpers/test-utils';
import HorizontalSplitFormComponent from './HorizontalSplitFormComponent';

describe('HorizontalSplitFormComponent', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <HorizontalSplitFormComponent
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
