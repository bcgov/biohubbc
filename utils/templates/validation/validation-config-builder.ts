import * as fs from 'fs';

// Build your validation config here, using any helper typescript functions or variables to reduce the manual effort
// needed to make the config.
const VALIDATION_SCHEMA = {
  name: '',
  description: '',
  files: [
    {
      name: '',
      description: '',
      validations: [],
      columns: [
        {
          name: '',
          description: '',
          validations: []
        }
      ]
    }
  ],
  validations: []
};

// Write the raw validation JSON config.
fs.writeFile('./validation_config.json', JSON.stringify(VALIDATION_SCHEMA), (error) => {
  throw new Error(JSON.stringify(error));
});
