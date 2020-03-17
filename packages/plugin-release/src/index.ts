import { Api } from '@walrus/types';

export default function(api: Api) {
  api.registerCommand({
    name: 'release',
    alias: 'r',
    description: 'publish your project',
    fn: ({ args }) => {
      console.log(args);
    }
  })
}
