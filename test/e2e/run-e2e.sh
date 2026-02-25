#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Running E2E Tests ===${NC}\n"

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${RED}Error: .env.test file not found${NC}"
    echo "Please create .env.test file in the root directory"
    exit 1
fi

# Load environment variables from .env.test
echo -e "${YELLOW}Loading environment variables from .env.test${NC}"
export $(grep -v '^#' .env.test | xargs)

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker first"
    exit 1
fi

# Check if MariaDB is running
if ! docker ps | grep -q mariadb; then
    echo -e "${YELLOW}Warning: MariaDB container not found${NC}"
    echo "Starting services..."
    docker compose up -d mariadb redis-session redis-cache
    echo "Waiting for services to be ready..."
    sleep 15
fi

# Check if test databases exist
echo -e "${YELLOW}Checking test databases...${NC}"
DB_CHECK=$(docker exec mariadb-dev mariadb -uroot -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES LIKE '%_test';" 2>/dev/null | grep -c "_test")

if [ "$DB_CHECK" -lt 2 ]; then
    echo -e "${YELLOW}Creating test databases...${NC}"
    docker exec mariadb-dev mariadb -uroot -p${DB_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS auth_db_test; CREATE DATABASE IF NOT EXISTS links_db_test;" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Test databases created${NC}"
    else
        echo -e "${RED}Error: Could not create test databases${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Test databases already exist${NC}"
fi

# Run tests
echo -e "\n${GREEN}Running E2E tests...${NC}\n"
env $(grep -v '^#' .env.test | xargs) jest --config test/e2e/jest-e2e.config.js --runInBand "$@"

TEST_EXIT_CODE=$?

# Cleanup (optional)
# echo -e "\n${YELLOW}Cleaning up test data...${NC}"
# docker exec mariadb mysql -uroot -p${DB_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS auth_db_test; DROP DATABASE IF EXISTS links_db_test;"

exit $TEST_EXIT_CODE
