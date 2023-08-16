import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { render } from 'test-helpers/test-utils';
import HorizontalSplitFormComponent from './HorizontalSplitFormComponent';

describe('HorizontalSplitFormComponent', () => {
  it.skip('renders correctly', () => {
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
