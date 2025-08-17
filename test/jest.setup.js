jest.setTimeout(30000);

const noop = () => {};

console.info = noop;
console.warn = noop;
console.error = noop;
