import { Api } from '@walrus/types';

export default function(api: Api) {
  api.describe({
    key: 'prettier',
    config: {
      default: {},
      schema(joi) {
        return joi.object({

        });
      },
    }
  });

  api.registerCommand({
    name: 'prettier',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      console.log('prettier');

    }
  })
}
