import { grey } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import 'styles.scss';

const appTheme = createMuiTheme({
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
    secondary: {
      main: '#D8292F'
    },
    text: {
      primary: '#313132',
      secondary: '#757575'
    },
    error: {
      main: '#A12622'
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
    },
    MuiAlertTitle: {
      root: {
        fontWeight: 700
      }
    },
    MuiAutocomplete: {
      tag: {
        fontWeight: 400
      }
    },
    MuiBreadcrumbs: {
      li: {
        maxWidth: '40ch',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        borderRadius: '5px',
        fontSize: '0.9rem',
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
      containedPrimary: {
        fontWeight: 700
      },
      containedSecondary: {
        fontWeight: 700
      },
      outlinedPrimary: {
        backgroundColor: '#ffffff',
        borderColor: '#003366',
        '&:hover': {
          backgroundColor: '#ffffff'
        }
      }
    },
    MuiChip: {
      root: {
        minWidth: '6rem',
        fontWeight: 700
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
        paddingTop: '24px'
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
    MuiIconButton: {
      root: {
        '&:focus': {
          outline: '3px solid #3B99FC',
          outlineOffset: '-3px'
        }
      }
    },
    MuiLink: {
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
    },
    MuiLinearProgress: {
      root: {
        height: '6px',
        borderRadius: '3px'
      }
    },
    MuiListItem: {
      root: {
        '&:last-of-type': {
          borderBottom: 'none'
        }
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: '42px'
      }
    },
    MuiPaper: {
      rounded: {
        borderRadius: '6px'
      }
    },
    MuiTable: {
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
    },
    MuiTableCell: {
      head: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: grey[600]
      }
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        minWidth: '100px !important',
        fontWeight: 700
      }
    }
  },
  props: {
    MuiButton: {
      disableElevation: true
    },
    MuiButtonBase: {
      disableRipple: true
    }
  }
});

export default appTheme;
