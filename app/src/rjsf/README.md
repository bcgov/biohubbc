# bcgov/biohubbc/app/src/rjsf

Contains config and components used by rjsf.

## Documentation

- [rjsf GitHub](https://github.com/rjsf-team/react-jsonschema-form)
- [rjsf docs](https://react-jsonschema-form.readthedocs.io/en/latest/)
- [rjsf demos](https://rjsf-team.github.io/react-jsonschema-form/)
- [rjsf material-ui theme](https://www.npmjs.com/package/@rjsf/material-ui)

## Folders

### Templates

The 3 base [rjsf templates](https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-templates/) used by rjsf when rendering form elements.

These are copied from the [@rjsf/material-ui](https://www.npmjs.com/package/@rjsf/material-ui) package as a starting point.

Why? BiodiversityHub BC needs some custom styling for their forms that is not currently possible using the stock rjsf themes. It may be possible to inject some custom components, which rjsf has some provisions to allow, but the code needed to achieve that would likely be similar in size/complexity to the stock template components themselves. In this case, stealing and modifying them locally is simpler and tantamount to re-creating them ourselves.

### Components

Rjsf specific react components used by custom templates and widgets.
