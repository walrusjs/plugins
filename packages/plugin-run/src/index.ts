import { Api } from '@walrus/types';
import { scriptRun } from '@walrus/script-run';

export default function (api: Api) {
  api.registerCommand({
    name: 'run',
    description: 'Run a js/ts script',
    fn: async () => {
      const argv = process.argv;
      argv.splice(0, 3)

      try {
        scriptRun(argv);
      } catch {
        process.exit(1);
      }
    }
  });
}
