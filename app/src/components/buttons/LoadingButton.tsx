import { makeStyles } from '@material-ui/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import React from 'react'

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative'
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

export type LoadingButtonProps = ButtonProps & { loading: boolean }

/**
 * An MUI `Button` component with an added `loading` prop, which displays a spinner and disables the button until `loading`
 * becomes false. Notably, this kind of component is already available in MUI Lab, but only in MUI v5. See:
 * https://mui.com/material-ui/api/loading-button/
 *
 * @param {LoadingButtonProps} props
 * @return {*} 
 */
const LoadingButton = (props: LoadingButtonProps) => {
  const { disabled, loading, ...rest } = props;
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Button
        disabled={disabled || loading}
        {...rest}
      />
      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
    </Box>
  )
}

export default LoadingButton
