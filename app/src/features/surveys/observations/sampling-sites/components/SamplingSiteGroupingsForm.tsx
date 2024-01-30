import SamplingBlockForm from "./SamplingBlockForm";
import SamplingStratumForm from "./SamplingStratumForm";
import { Box } from "@mui/material";

const SamplingSiteGroupingsForm  = () => {

    return (<>
                <SamplingBlockForm/>
                <Box mt={5}>
                    <SamplingStratumForm/>
                </Box>
            </>)
}

export default SamplingSiteGroupingsForm;