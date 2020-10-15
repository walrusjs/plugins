import { Api } from '@walrus/types';

export default function (api: Api) {
  api.registerCommand({
    name: 'entry',
    description: 'generate entry file',
    fn: async ({ args }) => {

    }
  });
}
