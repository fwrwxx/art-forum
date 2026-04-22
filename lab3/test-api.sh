#!/bin/bash

# Налаштування
BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "ArtHub Auth API - Тестування"
echo "========================================="
echo ""

# Тест 1: Health Check
echo -e "${YELLOW}Тест 1: Health Check${NC}"
curl -s -X GET "${BASE_URL}/health" | jq '.'
echo ""

# Тест 2: Реєстрація
echo -e "${YELLOW}Тест 2: Реєстрація нового користувача${NC}"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test_${TIMESTAMP}@arthub.com\",
    \"password\": \"Password123!\",
    \"confirmPassword\": \"Password123!\",
    \"full_name\": \"Тестовий Користувач\"
  }")
echo $REGISTER_RESPONSE | jq '.'

# Перевірка чи реєстрація успішна
if echo $REGISTER_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Реєстрація успішна${NC}"
else
  echo -e "${RED}Помилка реєстрації${NC}"
fi
echo ""

# Тест 3: Логін
echo -e "${YELLOW}Тест 3: Вхід в систему${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@arthub.com",
    "password": "Password123!"
  }')
echo $LOGIN_RESPONSE | jq '.'

# Збереження токенів
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id')

if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
  echo -e "${GREEN}Логін успішний${NC}"
  echo "   Access Token отримано"
  echo "   Refresh Token отримано"
else
  echo -e "${RED}Помилка логіну${NC}"
fi
echo ""

# Тест 4: Отримання профілю
echo -e "${YELLOW}Тест 4: Отримання профілю (захищений маршрут)${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
echo $PROFILE_RESPONSE | jq '.'
if echo $PROFILE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Доступ до захищеного маршруту дозволено${NC}"
else
  echo -e "${RED}Помилка доступу${NC}"
fi
echo ""

# Тест 5: Оновлення профілю
echo -e "${YELLOW}Тест 5: Оновлення профілю${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/profile/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "full_name": "Оновлений Користувач API"
  }')
echo $UPDATE_RESPONSE | jq '.'
if echo $UPDATE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Профіль оновлено${NC}"
else
  echo -e "${RED}Помилка оновлення${NC}"
fi
echo ""

# Тест 6: Отримання всіх користувачів (Admin)
echo -e "${YELLOW}Тест 6: Отримання всіх користувачів${NC}"
USERS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/users" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
echo $USERS_RESPONSE | jq '.'
if echo $USERS_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Отримано список користувачів${NC}"
else
  echo -e "${RED}Помилка отримання списку (можливо, недостатньо прав)${NC}"
fi
echo ""

# Тест 7: Refresh Token
echo -e "${YELLOW}Тест 7: Оновлення токену${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")
echo $REFRESH_RESPONSE | jq '.'
if echo $REFRESH_RESPONSE | grep -q '"success":true'; then
  NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.data.accessToken')
  echo -e "${GREEN}Токен оновлено${NC}"
else
  echo -e "${RED}Помилка оновлення токену${NC}"
fi
echo ""

# Тест 8: Тестування валідації - некоректний email
echo -e "${YELLOW}Тест 8: Реєстрація з некоректним email${NC}"
INVALID_REGISTER=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "full_name": "Тест"
  }')
echo $INVALID_REGISTER | jq '.'
if echo $INVALID_REGISTER | grep -q '"success":false'; then
  echo -e "${GREEN}Валідація спрацювала - помилка виявлена${NC}"
else
  echo -e "${RED}Валідація не спрацювала${NC}"
fi
echo ""

# Тест 9: Доступ без токена
echo -e "${YELLOW}Тест 9: Доступ без токена${NC}"
NO_TOKEN_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile/me")
echo $NO_TOKEN_RESPONSE | jq '.'
if echo $NO_TOKEN_RESPONSE | grep -q "Not authorized"; then
  echo -e "${GREEN}Доступ заборонено - токен відсутній${NC}"
else
  echo -e "${RED}Помилка: доступ без токена дозволено${NC}"
fi
echo ""

# Тест 10: Logout
echo -e "${YELLOW}Тест 10: Вихід з системи${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")
echo $LOGOUT_RESPONSE | jq '.'
if echo $LOGOUT_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Вихід виконано${NC}"
else
  echo -e "${RED}Помилка виходу${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}Тестування завершено${NC}"
echo "========================================="