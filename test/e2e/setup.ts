// Setup para tests e2e
// Los servicios deben estar corriendo antes de ejecutar tests
// El script run-e2e-simple.sh verifica esto antes de ejecutar Jest

beforeAll(() => {
  console.log('🚀 Iniciando tests e2e contra servicios corriendo...\n');
});
