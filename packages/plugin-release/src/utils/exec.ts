import { spawn } from 'child_process';

export default function exec(command: string, args: string[], opts?) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      command,
      args,
      Object.assign({ stdio: 'inherit', env: process.env }, opts),
    );

    child.once('error', err => {
      console.log(err);
      reject(err);
    });

    child.once('close', code => {
      if (code === 1) {
        process.exit(1);
      } else {
        resolve();
      }
    });
  })
}
