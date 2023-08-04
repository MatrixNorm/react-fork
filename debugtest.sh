NODE_ENV=development \
RELEASE_CHANNEL=experimental \
compactConsole=false \
node --inspect=127.0.0.1:9230 --inspect-brk \
./scripts/jest/jest.js --config ./scripts/jest/config.source.js "$@"