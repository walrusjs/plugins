import { Api } from '@walrus/types';

export default function(api: Api) {
  api.describe({
    key: 'stylelint',
    config: {
      default: {},
      schema(joi) {
        return joi.object({

        });
      },
    }
  });

  api.registerCommand({
    name: 'stylelint',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      console.log('stylelint');

    }
  })
}
