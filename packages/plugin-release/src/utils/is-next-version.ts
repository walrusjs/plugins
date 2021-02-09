export default function isNextVersion(version: string): boolean {
  if (!version) return false;
  return (
    version.includes('-rc.') ||
    version.includes('-beta.') ||
    version.includes('-alpha.')
  );
}
