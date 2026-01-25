from sqlalchemy import func

from db.base import engine, SessionLocal
from models.transaction import Transaction
from models.category import Category


def print_sums_by_category() -> None:
    session = SessionLocal()
    try:
        query = (
            session.query(
                Category.id,
                Category.name,
                Category.type,
                func.coalesce(func.sum(Transaction.amount_minor), 0).label("sum_minor"),
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .group_by(Category.id, Category.name, Category.type)
            .order_by(Category.id)
        )

        for cat_id, name, type_, sum_minor in query.all():
            amount = sum_minor / 100  # в рубли
            print(f"[{cat_id}] {type_:7} {name:15} = {amount:.2f} RUB")
    finally:
        session.close()


if __name__ == "__main__":
    print_sums_by_category()
