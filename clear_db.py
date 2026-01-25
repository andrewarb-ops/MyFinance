# scripts/clear_db.py
from sqlalchemy import text

from db.base import engine  # путь может быть db.base, если как в проекте

def main() -> None:
    print("Clearing database...")

    # Порядок важен из‑за внешних ключей: сначала транзакции/бюджеты, потом справочники
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM transactions;"))
        conn.execute(text("DELETE FROM budgets;"))
        conn.execute(text("DELETE FROM accounts;"))
        conn.execute(text("DELETE FROM categories;"))

    print("Done. All tables are empty.")

if __name__ == "__main__":
    main()
