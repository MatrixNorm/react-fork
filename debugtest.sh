JEST_ENABLE_SOURCE_MAPS=true \
NODE_ENV=development \
RELEASE_CHANNEL=value_to_make__DEV__equal_to_false \
compactConsole=false \
node --inspect=127.0.0.1:9230 --inspect-brk \
./scripts/jest/jest.js --config ./scripts/jest/config.source.js "$@"

# JEST_ENABLE_SOURCE_MAPS=true yarn test --debug "$@"
