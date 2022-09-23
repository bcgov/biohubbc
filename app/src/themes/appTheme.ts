import { createMuiTheme } from '@material-ui/core';
import 'styles.scss';

const appTheme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1600
    }
  },
  palette: {
    // https://material-ui.com/customization/palette/
    background: {
      default: '#f1f1f1'
    },
    primary: {
      light: '#5469a4',
      main: '#003366', // BC ID: corporate blue
      dark: '#001949',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#D8292F'
    },
    text: {
      primary: '#313132',
      secondary: '#7f7f81'
    }
  },
  typography: {
    fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(',')
  },
  overrides: {
    MuiTypography: {
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 700
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 700
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 700
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 700
      },
      h6: {
        fontWeight: 700
      }
    },
    MuiAlert: {
      root: {
        alignItems: 'center',
        fontSize: '1rem'
      }
    },
    MuiButton: {
      root: {
        textTransform: 'none'
      },
      sizeLarge: {
        fontSize: '1rem'
      },
      containedPrimary: {
        fontWeight: 700
      },
      outlinedPrimary: {
        backgroundColor: '#ffffff',
        borderColor: '#003366',
        '&:hover': {
          backgroundColor: '#ffffff'
        }
      },
      endIcon: {
        marginLeft: '4px'
      }
    },
    MuiContainer: {
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
        padding: '20px 24px',
        '& button': {
          minWidth: '6rem'
        }
      }
    },
    MuiFormHelperText: {
      root: {
        fontSize: '0.875rem'
      }
    },
    MuiLink: {
      root: {
        textAlign: 'left',
        color: '#1a5a96',
        cursor: 'pointer'
      }
    },
    MuiLinearProgress: {
      root: {
        height: '6px',
        borderRadius: '3px'
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: '42px'
      }
    },
    MuiTableCell: {
      root: {
        verticalAlign: 'top'
      },
      head: {
        backgroundColor: '#f5f5f5',
        lineHeight: 'normal'
      }
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        minWidth: '100px !important',
        fontWeight: 700
      }
    }
  }
});

export default appTheme;
