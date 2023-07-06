
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

## Run tests

Single test module:
```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js
```

Single test from module:
```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js -t mount
```

## Run test with debugger

XXX

