# _NOTE: NEEDS UPDATING_

# Summary Templates

The summary templates operate slightly differently than the Occurence templates. They should all be the same shape of tempalte. The Picklist values for each of these templates changs so that is something to be aware of. This readme will outline a few important places in code as well as the current (Sept. 13, 2022) requirements for the summary templates. These templates don't require migrations as all the validation is done in code.

## Setup

1. Get the summary template from Confluence BioHub BC & SIMS -> Data and Standards -> SIMS Templates
2. Compare template to [required fields](#required-fields-and-types)
3. Test template validation
4. Add tempalte to resource page in SIMS (BioHub)
5. [Connect](./S3%20Browser.md) and add file to S3 Bucket templates folder

### Important locations

```
// this file outlines all the actions that a template goes through
// this is where the file is uploaded to S3
// this is where the file is prepped and validated as well
biohubbc/api/src/project/{projectId}/survey/{surveyId}/summary/submission/upload.ts

// Resource Page lists all templates available to users
biohubbc/app/src/resources/ResourcesPage.tsx
```

### Required Fields and types

| Column                         | Type     | Description                                        |
| ------------------------------ | -------- | -------------------------------------------------- |
| Study Area                     | Text     |
| Population Unit                | Text     |
| Block ID/SU ID                 | Text     |
| Parameter                      | Picklist | Parameter Statistic, species specific descriptions |
| Stratum                        | Numeric  |
| Observed                       | Numeric  |
| Estimated                      | Numeric  |
| Sightability Model             | Picklist | Sightability Model                                 |
| Sightability Correction Factor | Numeric  |
| SE                             | Numeric  |
| Coefficient of Variation (%)   | Numeric  |
| Confidence Level (%)           | Numeric  |
| Lower CL                       | Numeric  |
| Upper CL                       | Numeric  |
| Total Suvey Area (km2)         | Numeric  |
| Area Flown (km2)               | Numeric  |
| Total Kilometers Surveyed (km) | Numeric  |
| Best Parameter Value Flag      | Picklist | Best Paramter Flag                                 |
| Outlier Blocks Removed         | Text     |
| Total Marked Animals Observed  | Numeric  |
| Marked Animals Available       | Numeric  |
| Parameter Comments             | Text     |
