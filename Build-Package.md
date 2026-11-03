## Build & publish

Requires Node `^22.22.3`, `^24.15.0` or `>=26` (Angular 22).

```bash
npm install
npm test -- --watch=false --browsers=ChromeHeadless
ng build ng-spinner-wheel
```

Bump `version` in `projects/ng-spinner-wheel/package.json` (npm rejects a version that is already published), then:

```bash
cd dist/ng-spinner-wheel
npm publish --access public
```

## Try the package locally before publishing

```bash
ng build ng-spinner-wheel
cd dist/ng-spinner-wheel
npm pack                      # creates ng-spinner-wheel-<version>.tgz
# in your test app:
npm install <path-to>/dist/ng-spinner-wheel/ng-spinner-wheel-<version>.tgz
```
