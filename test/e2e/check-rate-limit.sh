#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Checking rate limit configuration...${NC}\n"

# Make multiple requests to trigger rate limit
echo "Making 70 requests to auth service to test rate limit..."
count=0
for i in {1..70}; do
  response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:60200/auth/login -X POST -H "Content-Type: application/json" -d '{}')
  if [ "$response" = "429" ]; then
    echo -e "${RED}✗ Rate limited after $i requests${NC}"
    echo -e "${YELLOW}Current THROTTLE_LIMIT appears to be around $i${NC}"
    echo -e "${RED}Expected: 10000, Got: ~$i${NC}\n"
    echo -e "${YELLOW}→ Services need to be restarted to load THROTTLE_LIMIT=10000 from .env${NC}"
    exit 1
  fi
  count=$i
done

echo -e "${GREEN}✓ Made $count requests without rate limiting${NC}"
echo -e "${GREEN}Rate limit configuration looks good!${NC}"
