NODE_ENV=development \
RELEASE_CHANNEL=experimental \
compactConsole=false \
node ./scripts/jest/jest.js --config ./scripts/jest/config.source.js "$@"