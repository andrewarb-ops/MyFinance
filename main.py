from services.accounts import create_account
from services.categories import create_category, list_categories
from services.transactions import add_income, add_expense, add_transfer, get_account_balance


def main():
    # категории
    salary = create_category("Зарплата", "income")
    food = create_category("Продукты", "expense")

    # счета
    acc1 = create_account("Наличные", "cash")
    acc2 = create_account("T-Банк карта", "card")

    # операции
    add_income(
        acc1["id"],
        category_id=salary["id"],
        amount_minor=100_00,
        description="Зарплата"
    )
    add_expense(
        acc1["id"],
        category_id=food["id"],
        amount_minor=30_00,
        description="Продукты"
    )
    add_transfer(
        acc1["id"],
        acc2["id"],
        amount_minor=20_00,
        description="Перевод на карту"
    )

    print("Баланс нал:", get_account_balance(acc1["id"]) / 100, "RUB")
    print("Баланс карты:", get_account_balance(acc2["id"]) / 100, "RUB")


if __name__ == "__main__":
    main()
