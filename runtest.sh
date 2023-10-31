NODE_ENV=development \
RELEASE_CHANNEL=not_experimental \
compactConsole=false \
node --inspect=127.0.0.1:9230 \
./scripts/jest/jest.js --config ./scripts/jest/config.source.js "$@"