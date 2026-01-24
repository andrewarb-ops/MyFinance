from services.accounts import create_account, list_accounts

def main():
    create_account("Наличные", "cash")
    create_account("T-Банк", "card")

    for acc in list_accounts():
        print(acc["id"], acc["name"], acc["type"], acc["currency"])

if __name__ == "__main__":
    main()