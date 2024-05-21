Note:

-  pnpm is locked at 9.0.6 or higher

##### lint staged

there will be a linting and typescript check every commit to ensure a type safe codebase before pushing the code to github or before deploying it

##### about commits

commits is following the [commit lint package.](https://www.npmjs.com/package/@commitlint/)
this is the [conventional commits docs](https://www.conventionalcommits.org/en/v1.0.0/#summary) where you can only pass the values:

(case sensitive)

```
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test'
```

example:

```
echo "foo: some message" # fails
echo "FIX: some message" # fails
echo "fix: some message" # passes
```
