#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Running E2E Tests (Opción B: Servicios corriendo) ===${NC}\n"

# Check if services are running
echo -e "${YELLOW}Verificando servicios...${NC}"

# Check Auth service
if ! curl -s -k https://localhost:60200/auth/login -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo -e "${RED}❌ Auth service NO está corriendo en http://localhost:60200${NC}"
    echo -e "${YELLOW}   Ejecuta en otra terminal: npm run start:auth:dev${NC}\n"
    exit 1
fi

# Check Links service
if ! curl -s -k https://localhost:60201/links/1 > /dev/null 2>&1; then
    echo -e "${RED}❌ Links service NO está corriendo en http://localhost:60201${NC}"
    echo -e "${YELLOW}   Ejecuta en otra terminal: npm run start:links:dev${NC}\n"
    exit 1
fi

echo -e "${GREEN}✅ Auth service: https://localhost:60200${NC}"
echo -e "${GREEN}✅ Links service: https://localhost:60201${NC}\n"

# Run tests
echo -e "${GREEN}Ejecutando tests e2e...${NC}\n"

export AUTH_SERVICE_URL=https://localhost:60200
export LINKS_SERVICE_URL=https://localhost:60201
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_NO_WARNINGS=1

echo -e "${YELLOW}Running Auth E2E Suite...${NC}"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config apps/auth/test/jest-e2e.config.js --runInBand --testPathIgnorePatterns zz-rate-limiting "$@"
AUTH_EXIT_CODE=$?

echo -e "\n${YELLOW}Running Links E2E Suite...${NC}"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config apps/links/test/jest-e2e.config.js --runInBand --testPathIgnorePatterns zz-rate-limiting "$@"
LINKS_EXIT_CODE=$?

echo -e "\n${YELLOW}Running Common/Health E2E Suite...${NC}"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config test/e2e/jest-e2e.config.js test/e2e/common/health.e2e-spec.ts "$@"
HEALTH_EXIT_CODE=$?

echo -e "\n${YELLOW}Running Final Rate Limiting E2E Test...${NC}"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config test/e2e/jest-e2e.config.js test/e2e/zz-rate-limiting.e2e-spec.ts "$@"
RATELIMIT_EXIT_CODE=$?

if [ $AUTH_EXIT_CODE -eq 0 ] && [ $LINKS_EXIT_CODE -eq 0 ] && [ $HEALTH_EXIT_CODE -eq 0 ] && [ $RATELIMIT_EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✅ All Suites Completed Successfully${NC}"
    TEST_EXIT_CODE=0
else
    echo -e "\n${RED}❌ Some Tests Failed${NC}"
    TEST_EXIT_CODE=1
fi

exit $TEST_EXIT_CODE
