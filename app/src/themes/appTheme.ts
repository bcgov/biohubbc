import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import 'styles.scss';

const appTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1720
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
    text: {
      primary: '#313132',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(','),
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
      fontSize: '1rem',
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    }
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '1rem'
        },
        icon: {
          marginRight: '1rem'
        },
        outlinedInfo: {
          color: '#313132',
          borderColor: '#afd3ee',
          backgroundColor: 'rgb(232, 244, 253)',
          '& .MuiAlert-icon': {
            color: 'inherit'
          }
        },
        outlinedSuccess: {
          color: '#1e4620',
          borderColor: '#4caf50',
          backgroundColor: 'rgb(223 240 216)',
          '& .MuiAlert-icon': {
            color: 'inherit'
          }
        },
        standardError: {
          color: '#a12622',
          borderColor: '#ebccd1',
          '& .MuiAlert-icon': {
            color: '#a12622'
          }
        },
        standardSuccess: {
          color: '#2d4821',
          backgroundColor: '#dff0d8',
          borderColor: '#c0dcb3',
          '& .MuiAlert-icon': {
            color: '#2d4821'
          }
        }
      }
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          fontWeight: 400
        }
      }
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        li: {
          maxWidth: '40ch',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&:focus': {
            outline: '3px solid #3B99FC',
            outlineOffset: '-1px'
          }
        },
        startIcon: {
          marginBottom: '1px'
        },
        sizeLarge: {
          fontSize: '1rem'
        },
        outlinedPrimary: {
          backgroundColor: '#ffffff',
          borderColor: '#003366',
          '&:hover': {
            backgroundColor: '#ffffff'
          }
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'xl',
          margin: 'auto'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paperWidthXl: {
          width: '800px'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingTop: '24px'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: '8px !important' /* Any form fields inside this component get clipped if we don't add this */
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          '& button': {
            minWidth: '6rem'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: '3px solid #3B99FC',
            outlineOffset: '-3px'
          }
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textAlign: 'left',
          color: '#1a5a96',
          borderRadius: '1px',
          cursor: 'pointer',
          '&:focus': {
            outline: '2px solid #3B99FC',
            outlineOffset: '2px'
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '6px',
          borderRadius: '3px'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:last-of-type': {
            borderBottom: 'none'
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '42px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '6px'
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& th': {
            letterSpacing: '0.02rem',
            textTransform: 'uppercase',
            paddingTop: '12px',
            paddingBottom: '12px'
          },
          '& tr:last-of-type td': {
            borderBottom: 'none'
          },
          '& .MuiLink-root': {
            fontFamily: 'inherit',
            fontSize: 'inherit'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: '0.875rem',
          fontWeight: 700,
          color: grey[600]
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: '100px !important',
          fontWeight: 700
        }
      }
    }
  }
});

declare module '@mui/material/styles' {
  interface Palette {
    bcgovblue: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    bcgovblue?: PaletteOptions['primary'];
  }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    bcgovblue: true;
  }
}

export default appTheme;
