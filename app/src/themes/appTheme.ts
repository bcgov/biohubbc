// import createBreakpoints from '@material-ui/core/styles/createBreakpoints'
import { grey } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import 'styles.scss';

// const breakpoints = createBreakpoints({})

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
        fontSize: '0.9rem',
        borderRadius: '5px'
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
      }
    },
    MuiChip: {
      colorSecondary: {
        backgroundColor: 'red'
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
          textTransform: 'uppercase'
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
      root: {
        fontSize: '0.9rem'
      },
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
  }
});

export default appTheme;
