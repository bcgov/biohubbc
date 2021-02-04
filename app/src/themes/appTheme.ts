import { createMuiTheme } from '@material-ui/core';
import 'styles.scss';

const appTheme = createMuiTheme({
  palette: {
    // https://material-ui.com/customization/palette/
    primary: {
      light: '#5469a4',
      main: '#223f75', // BC ID: corporate blue
      dark: '#001949',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#ffd95e',
      main: '#e3a82b', // BC ID: corporate gold
      dark: '#ad7900',
      contrastText: '#000000'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.67)',
      disabled: 'rgba(0, 0, 0, 0.67)'
    }
  },
  typography: {
    fontFamily: ['BCSans', '"Noto Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(',')
  },
  overrides: {
    MuiTypography: {
      // https://material-ui.com/api/typography/
      h1: {
        fontSize: '3rem'
      },
      h2: {
        fontSize: '2.5rem',
        fontWeight: 700
      },
      h3: {
        fontSize: '2rem',
        fontWeight: 600
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600
      },
      h5: {
        fontSize: '1.25rem'
      },
      h6: {
        fontSize: '1rem'
      }
    },
    MuiCircularProgress: {
      // https://material-ui.com/api/circular-progress/
      root: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: '60px !important',
        width: '60px !important',
        marginLeft: '-30px',
        marginTop: '-30px'
      }
    },
    MuiContainer: {
      // https://material-ui.com/api/container/
      root: {
        maxWidth: 'xl',
        margin: 'auto'
      }
    },
    MuiStepLabel: {
      labelContainer: {
        paddingLeft: '2.3rem'
      }
    },
    MuiStepContent: {
      root: {
        paddingLeft: '4rem'
      }
    },
    MuiStepIcon: {
      root: {
        fontSize: '2.5rem',
        marginLeft: '-.525rem'
      }
    },
    MuiFormLabel: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131'
        }
      }
    }
  }
});

export default appTheme;
