import { createMuiTheme } from '@material-ui/core';
import 'styles.scss';

const appTheme = createMuiTheme({
  palette: {
    // https://material-ui.com/customization/palette/
    primary: {
      light: '#5469a4',
      main: '#003366', // BC ID: corporate blue
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
    fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(',')
  },
  overrides: {
    MuiTypography: {
      // https://material-ui.com/api/typography/
      h1: {
        letterSpacing: '-0.01rem',
        fontSize: '2rem',
        fontWeight: 700
      },
      h2: {
        letterSpacing: '-0.01rem',
        fontSize: '1.5rem',
        fontWeight: 700
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 700
      },
      h6: {
        letterSpacing: '-0.01rem',
        fontWeight: 700
      }
    },
    MuiButton: {
      root: {
        textTransform: 'none'
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
    MuiDialog: {
      paperWidthXl: {
        width: '800px'
      }
    },
    MuiDialogTitle: {
      root: {
        padding: '20px 24px'
      }
    },
    MuiDialogActions: {
      root: {
        padding: '20px 24px'
      }
    },
    MuiFormLabel: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131'
        }
      }
    },
    MuiStepLabel: {
      labelContainer: {
        paddingLeft: '3rem'
      },
      iconContainer: {
        width: '3rem',
        height: '3rem',
        paddingRight: 0,
        borderRadius: '1.25rem'
      }
    },
    MuiStepIcon: {
      root: {
        width: '3rem',
        height: '3rem',
        color: '#003366'
      },
      text: {
        color: '#003366',
        fontSize: '40%',
        fontWeight: 700
      },
      active: {
        color: 'transparent'
      }
    },
    MuiStepContent: {
      root: {
        marginTop: 0,
        marginLeft: '1.5rem',
        paddingTop: '1rem',
        paddingBottom: 0,
        paddingLeft: '4.5rem'
      }
    },
    MuiStepConnector: {
      vertical: {
        marginLeft: '1.5rem',
        padding: '0'
      }
    }
  }
});

export default appTheme;
