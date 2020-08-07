import { execa } from '@walrus/utils';

process.setMaxListeners(Infinity);

export default function syncTNpm(packageNames: string[] = []) {
  const commands = packageNames.map((pkg) => {
    const subprocess = execa('tnpm', ['sync', pkg]);
    subprocess.stdout.pipe(process.stdout);
    return subprocess;
  });
  Promise.all(commands);
}
