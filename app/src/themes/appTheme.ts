import grey from '@mui/material/colors/grey';
import { createTheme } from '@mui/material/styles';
import 'styles.scss';
import 'styles/fonts.scss';

const appTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1440,
      xl: 1720
    }
  },
  palette: {
    // https://material-ui.com/customization/palette/
    background: {
      default: grey[100]
    },
    primary: {
      light: '#5469a4',
      main: '#003366',
      dark: '#001949',
      contrastText: '#ffffff'
    },
    success: {
      main: '#2E8540'
    },
    error: {
      main: '#D8292F'
    },
    text: {
      primary: '#313132',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      paddingTop: '4px',
      paddingBottom: '8px',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      maxWidth: '72ch',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700
    },
    h4: {
      fontSize: '1.125rem',
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
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          color: '#1a5a96',
          '&:focus': {
            outline: '2px solid #3B99FC',
            outlineOffset: '-1px',
            borderRadius: '4px'
          }
        },
        fieldset: {
          margin: 0,
          padding: 0,
          minWidth: 0,
          border: 'none'
        },
        legend: {
          '&.MuiTypography-root': {
            marginBottom: '15px',
            padding: 0,
            fontWeight: 700
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        outlinedError: {
          background: 'rgb(251, 237, 238)'
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
        root: {
          marginTop: '-4px',
          marginBottom: '4px',
          marginLeft: '-4px'
        },
        li: {
          maxWidth: '40ch',
          padding: '4px',
          whiteSpace: 'nowrap',
          '& a': {
            display: 'block',
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          },
          '& span': {
            display: 'block',
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        },
        separator: {
          marginRight: '4px',
          marginLeft: '4px'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        // disableElevation: true
      },
      styleOverrides: {
        root: {
          '&:focus': {
            outline: '2px solid #3B99FC',
            outlineOffset: '-1px'
          }
        },
        startIcon: {
          marginBottom: '1px'
        },
        sizeLarge: {
          fontSize: '1rem'
        },
        containedPrimary: {
          fontWeight: 700,
          letterSpacing: '0.02rem'
        },
        containedError: {
          fontWeight: 700,
          letterSpacing: '0.02rem'
        },
        outlinedPrimary: {
          fontWeight: 700,
          letterSpacing: '0.02rem'
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minWidth: '6rem;'
        }
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
          minWidth: '600px'
        },
        paperFullScreen: {
          minWidth: '100%'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingTop: '24px',
          paddingBottom: '8px'
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
          padding: '24px',
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
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: '#fff',
          '&.Mui-error': {}
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            top: '-4px'
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
          cursor: 'pointer'
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
    MuiListItemText: {
      styleOverrides: {
        root: {
          borderRadius: '3px'
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
          fontSize: '0.875rem',
          '& tr:last-of-type td': {
            borderBottom: 'none'
          },
          '& thead': {
            background: grey[50]
          },
          '& th': {
            letterSpacing: '0.02rem',
            textTransform: 'uppercase',
            paddingTop: '12px',
            paddingBottom: '12px',
            height: '52px'
          },
          '& td': {
            height: '52px'
          },
          '& th:first-of-type, td:first-of-type': {
            paddingLeft: '16px'
          },
          '& th:last-of-type, td:last-of-type': {
            paddingRight: '16px'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingRight: '8px',
          paddingLeft: '8px'
        },
        head: {
          fontSize: '0.875rem',
          fontWeight: 700
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
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          background: '#fff'
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          '& h2, h3': {
            fontSize: '1.125rem'
          }
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
