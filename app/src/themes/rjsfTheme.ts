import { createMuiTheme } from '@material-ui/core';
import appTheme from './appTheme';

const rjsfTheme = createMuiTheme({
  ...appTheme,
  props: {
    MuiTextField: {
      variant: 'outlined'
    }
  }
});

export default rjsfTheme;
