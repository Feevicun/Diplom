#!/bin/bash
set -e

DB_CONTAINER="diplom-db-1"
DB_NAME="Diplom"
DB_USER="vikaosoba"
DUMP_FILE="dump.sql"

echo "🔄 Відновлення бази даних..."

# Перевіряємо чи існує контейнер
if ! docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
  echo "❌ Контейнер $DB_CONTAINER не запущений. Запусти docker-compose up -d"
  exit 1
fi

# Видаляємо стару базу якщо є
docker exec -i $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
echo "🗑 Стара база видалена (якщо існувала)."

# Створюємо нову
docker exec -i $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
echo "📦 Створено нову базу $DB_NAME."

# Відновлюємо дамп
cat $DUMP_FILE | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
echo "✅ Відновлення завершене!"
