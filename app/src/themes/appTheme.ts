import { createMuiTheme } from '@material-ui/core';
import 'styles.scss';

const appTheme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1440
    }
  },
  palette: {
    background: {
      default: '#f7f8fa'
    },
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
        letterSpacing: '-0.02rem',
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
      h4: {
        fontSize: '1rem',
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
      },
      outlinedPrimary: {
        background: '#ffffff'
      },
      containedPrimary: {
        fontWeight: 700
      },
      startIcon: {
        marginTop: '-1px'
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
        '&.Mui-error': {
          color: '#db3131'
        }
      }
    },
    MuiOutlinedInput: {
      root: {
        background: '#ffffff'
      }
    },
    MuiStepper: {
      root: {
        padding: 0
      }
    },
    MuiStep: {
      root: {
        cursor: 'pointer'
      }
    },
    MuiStepLabel: {
      active: {
        color: '#003366 !important'
      }
    },
    MuiStepIcon: {
      root: {
        marginLeft: '1rem',
        marginRight: '1rem',
        zIndex: 999,
        color: '#999999',
        fontSize: '33px',
        borderRadius: '50%',
        '&.Mui-error': {
          backgroundColor: '#ffffff',
          border: '3px solid red',
          color: 'red'
        }
      },
      text: {
        fontWeight: 700,
        fontSize: '0.35em'
      },
      active: {
        borderColor: '#003366',
        color: '#ffffff'
      },
      completed: {
        backgroundColor: '#ffffff',
        border: '3px solid #003366',
        padding: '2px',
        color: '#003366'
      }
    },
    MuiStepConnector: {
      vertical: {
        marginLeft: '32px',
        paddingBottom: 0
      },
      lineVertical: {
        borderLeftWidth: '2px'
      }
    },
    MuiTableCell: {
      root: {
        verticalAlign: 'top'
      },
      head: {
        fontWeight: 700,
        lineHeight: 'auto'
      }
    },
    MuiTab: {
      root: {
        textTransform: 'none'
      }
    }
  }
});

export default appTheme;
