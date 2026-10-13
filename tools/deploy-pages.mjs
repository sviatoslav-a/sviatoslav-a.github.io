// Publish the already-built static site to gh-pages without changing the working tree.
// One-time setup is documented in README. Requires gh auth for sviatoslav-a.
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const owner = 'sviatoslav-a';
const repo = 'sviatoslav-a.github.io';
const login = execFileSync('gh', ['api', 'user', '--jq', '.login'], { encoding: 'utf8' }).trim();
if (login !== owner) throw new Error(`Select ${owner} with gh auth switch before publishing`);
await access('dist/index.html');
const build = resolve('dist');
const temp = await mkdtemp(join(tmpdir(), 'portfolio-pages-'));
const git = (...args) => execFileSync('git', ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', ...args], { cwd: temp, encoding: 'utf8' });
try {
  git('init', '-b', 'gh-pages');
  git('config', 'user.name', 'Sviatoslav Alekseev');
  git('config', 'user.email', '342105200+sviatoslav-a@users.noreply.github.com');
  git('remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`);
  if (git('ls-remote', '--heads', 'origin', 'gh-pages').trim()) {
    git('fetch', '--depth=1', 'origin', 'gh-pages');
    git('reset', '--hard', 'FETCH_HEAD');
    git('rm', '-r', '--ignore-unmatch', '.');
  }
  await cp(build, temp, { recursive: true });
  await writeFile(join(temp, '.nojekyll'), '');
  git('add', '.');
  if (git('status', '--porcelain').trim()) {
    git('commit', '-m', 'Deploy portfolio to GitHub Pages');
    git('push', '-u', 'origin', 'gh-pages');
  }
  console.log('Published static branch. Site: https://sviatoslav-a.github.io/');
} finally {
  await rm(temp, { recursive: true, force: true });
}
