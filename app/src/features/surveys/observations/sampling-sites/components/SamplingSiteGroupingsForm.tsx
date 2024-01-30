import SamplingBlockStratumForm from "./SamplingBlockStratumForm";
import { useContext } from "react";
import { SurveyContext } from "contexts/surveyContext";
import { ISelectWithSubtextFieldOption } from "components/fields/SelectWithSubtext";

const SamplingSiteGroupingsForm  = () => {

  const surveyContext = useContext(SurveyContext);

  const surveyStratums: ISelectWithSubtextFieldOption[] | undefined = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums.map((stratum) => ({
    value: stratum.survey_stratum_id,
    label: stratum.name,
    subText: stratum.description || undefined
  }));

  const surveyBlocks: ISelectWithSubtextFieldOption[] | undefined = surveyContext.surveyDataLoader?.data?.surveyData?.blocks.map((block) => ({
      value: block.survey_block_id,
      label: block.name,
      subText: block.description
  }))

    return (<><SamplingBlockStratumForm
                          label="Assign to Stratum"
                          subHeader="All sampling sites being imported together will be assigned to the selected strata"
                          options={surveyStratums}
                          arrayFieldName="stratums"
                          addButtonLabel="Add Stratum"
                        />

                        <SamplingBlockStratumForm
                          label="Assign to Sampling Site Group"
                          subHeader="All sampling sites being imported together will be assigned to the selected sampling site groups"
                          options={surveyBlocks}
                          arrayFieldName="blocks"
                          addButtonLabel="Add Group"
                        /></>)
}

export default SamplingSiteGroupingsForm;