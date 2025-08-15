// Timeout global razonable
jest.setTimeout(30000);

// Silenciar ruido en tests (ajusta a tu gusto)
const noop = () => {};
// eslint-disable-next-line no-console
console.info = noop;
// eslint-disable-next-line no-console
console.warn = noop;
// eslint-disable-next-line no-console
console.error = noop;
