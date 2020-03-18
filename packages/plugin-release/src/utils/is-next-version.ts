export default function isNextVersion(version: string): boolean {
  return (
    version.includes('-rc.') ||
    version.includes('-beta.') ||
    version.includes('-alpha.')
  );
}
