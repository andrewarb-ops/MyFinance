from typing import List, Optional, TypedDict

from db import session_scope
from models.account import Account


class AccountDTO(TypedDict):
    id: int
    name: str
    type: str
    currency: str
    is_active: bool
    card_number: Optional[str]


def _mask_card_number(card_number: Optional[str]) -> Optional[str]:
    """Храним только маску вида '**** 1234'."""
    if not card_number:
        return None

    digits = "".join(ch for ch in card_number if ch.isdigit())
    if len(digits) < 4:
        return None

    last4 = digits[-4:]
    return f"**** {last4}"


def _to_dto(account: Account) -> AccountDTO:
    return AccountDTO(
        id=account.id,
        name=account.name,
        type=account.type,
        currency=account.currency,
        is_active=account.is_active,
        card_number=account.card_number,
    )


def create_account(
    name: str,
    type_: str,
    currency: str = "RUB",
    is_active: bool = True,
    card_number: Optional[str] = None,
) -> AccountDTO:
    """Создать новый счёт и вернуть его как DTO."""
    with session_scope() as session:
        account = Account(
            name=name,
            type=type_,
            currency=currency,
            is_active=is_active,
            card_number=_mask_card_number(card_number),
        )

        session.add(account)
        session.flush()  # получаем id
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


def update_account(
    account_id: int,
    name: Optional[str] = None,
    type_: Optional[str] = None,
    currency: Optional[str] = None,
    card_number: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Optional[AccountDTO]:
    """
    Частично обновить данные счёта.
    Возвращает DTO обновлённого счёта или None, если счёт не найден.
    """
    with session_scope() as session:
        account = (
            session.query(Account)
            .filter(Account.id == account_id)
            .first()
        )

        if account is None:
            return None

        if name is not None:
            account.name = name
        if type_ is not None:
            account.type = type_
        if currency is not None:
            account.currency = currency
        if card_number is not None:
            account.card_number = _mask_card_number(card_number)
        if is_active is not None:
            account.is_active = is_active

        session.add(account)
        session.flush()
        session.refresh(account)

        return _to_dto(account)


def delete_account(account_id: int) -> bool:
    """
    Полностью удалить счёт из базы.
    Возвращает True, если счёт был найден и удалён.
    """
    with session_scope() as session:
        account = (
            session.query(Account)
            .filter(Account.id == account_id)
            .first()
        )

        if account is None:
            return False

        session.delete(account)
        return True
