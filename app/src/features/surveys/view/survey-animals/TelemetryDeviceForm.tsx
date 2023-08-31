import { Typography } from "@mui/material"
import Grid from '@mui/material/Grid';
import { Form } from "formik"

const TelemetryDeviceForm = () => {

    return (
        <Form>
            <Typography variant="h4">Add Telemetry Device</Typography>
            <Grid item xs={6} key={'telemetry-device-section'}>

            </Grid>
        </Form>
    )
}

export default TelemetryDeviceForm;