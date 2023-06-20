
* You may need kill watchman precess if it runs in background otherwise test will no be run.

* xxx

```
$ yarn config set watchman false
```

```
$ yarn config list
```

```
$ cat ~/.yarnrc
```

```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js
```

```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js -t mount
```