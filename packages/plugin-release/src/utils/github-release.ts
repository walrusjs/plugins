interface BaseOptions {
  // The tag name of the release.
  tag: string;
  target: string;
  title: string;
  isPrerelease: string;
}

interface RepoUrlOptions extends BaseOptions {
  // The full URL to the repo.
  repoUrl?: string;
}

interface UserRepoOptions extends BaseOptions {
  // GitHub username or organization.
  readonly user: string;
  // GitHub repo.
  readonly repo: string;
}

function githubRelease(opts: RepoUrlOptions | UserRepoOptions) {
  let repoUrl: string = '';



}
