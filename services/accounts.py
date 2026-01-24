from typing import List, Optional, TypedDict

from db import session_scope
from models.account import Account


class AccountDTO(TypedDict):
    id: int
    name: str
    type: str
    currency: str
    is_active: bool


def _to_dto(account: Account) -> AccountDTO:
    return AccountDTO(
        id=account.id,
        name=account.name,
        type=account.type,
        currency=account.currency,
        is_active=account.is_active,
    )


def create_account(
    name: str,
    type_: str,
    currency: str = "RUB",
    is_active: bool = True,
) -> AccountDTO:
    """Создать новый счёт и вернуть его как DTO."""
    with session_scope() as session:
        account = Account(
            name=name,
            type=type_,
            currency=currency,
            is_active=is_active,
        )
        session.add(account)
        session.flush()      # получаем id
        session.refresh(account)
        return _to_dto(account)


def list_accounts(active_only: bool = True) -> List[AccountDTO]:
    """Получить список счетов как DTO."""
    with session_scope() as session:
        query = session.query(Account)
        if active_only:
            query = query.filter(Account.is_active.is_(True))
        accounts = query.order_by(Account.id).all()
        return [_to_dto(acc) for acc in accounts]


def get_account_by_id(account_id: int) -> Optional[AccountDTO]:
    """Найти счёт по id."""
    with session_scope() as session:
        account = (
            session.query(Account)
            .filter(Account.id == account_id)
            .first()
        )
        if account is None:
            return None
        return _to_dto(account)


def deactivate_account(account_id: int) -> bool:
    """Пометить счёт как неактивный. Возвращает True, если счёт найден."""
    with session_scope() as session:
        account = (
            session.query(Account)
            .filter(Account.id == account_id)
            .first()
        )
        if account is None:
            return False
        account.is_active = False
        session.add(account)
        return True