from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Literal

from db import session_scope
from models.transaction import Transaction
from models.account import Account


MoneySign = Literal["income", "expense"]


@dataclass
class TransactionDTO:
    id: int
    account_id: int
    category_id: Optional[int]
    amount_minor: int  # копейки, +доход, -расход
    currency: str
    dt: datetime
    description: Optional[str]
    transfer_group_id: Optional[int]


def _to_dto(tx: Transaction) -> TransactionDTO:
    return TransactionDTO(
        id=tx.id,
        account_id=tx.account_id,
        category_id=tx.category_id,
        amount_minor=tx.amount_minor,
        currency=tx.currency,
        dt=tx.dt,
        description=tx.description,
        transfer_group_id=tx.transfer_group_id,
    )


def add_income(
    account_id: int,
    category_id: int,
    amount_minor: int,
    dt: Optional[datetime] = None,
    description: Optional[str] = None,
    currency: str = "RUB",
) -> TransactionDTO:
    """Доход: сумма > 0."""
    if amount_minor <= 0:
        raise ValueError("amount_minor for income must be > 0")

    dt = dt or datetime.now()

    with session_scope() as session:
        # проверим, что счёт существует
        session.query(Account).filter(Account.id == account_id).one()

        tx = Transaction(
            account_id=account_id,
            category_id=category_id,
            amount_minor=amount_minor,
            currency=currency,
            dt=dt,
            description=description,
        )
        session.add(tx)
        session.flush()
        session.refresh(tx)
        return _to_dto(tx)


def add_expense(
    account_id: int,
    category_id: int,
    amount_minor: int,
    dt: Optional[datetime] = None,
    description: Optional[str] = None,
    currency: str = "RUB",
) -> TransactionDTO:
    """Расход: сумма < 0 (отрицательная)."""
    if amount_minor <= 0:
        raise ValueError("amount_minor for expense must be > 0")

    dt = dt or datetime.now()

    with session_scope() as session:
        session.query(Account).filter(Account.id == account_id).one()

        tx = Transaction(
            account_id=account_id,
            category_id=category_id,
            amount_minor=-amount_minor,  # делаем отрицательной
            currency=currency,
            dt=dt,
            description=description,
        )
        session.add(tx)
        session.flush()
        session.refresh(tx)
        return _to_dto(tx)


def add_transfer(
    from_account_id: int,
    to_account_id: int,
    amount_minor: int,
    dt: Optional[datetime] = None,
    description: Optional[str] = None,
    currency: str = "RUB",
) -> List[TransactionDTO]:
    """Перевод между счетами (две записи с общим transfer_group_id)."""
    if amount_minor <= 0:
        raise ValueError("amount_minor for transfer must be > 0")

    dt = dt or datetime.now()

    with session_scope() as session:
        # проверим, что оба счета существуют
        session.query(Account).filter(Account.id == from_account_id).one()
        session.query(Account).filter(Account.id == to_account_id).one()

        # создаём списание
        out_tx = Transaction(
            account_id=from_account_id,
            category_id=None,
            amount_minor=-amount_minor,
            currency=currency,
            dt=dt,
            description=description,
        )
        session.add(out_tx)
        session.flush()

        transfer_group_id = out_tx.id  # id первой записи как идентификатор группы
        out_tx.transfer_group_id = transfer_group_id

        # создаём зачисление
        in_tx = Transaction(
            account_id=to_account_id,
            category_id=None,
            amount_minor=amount_minor,
            currency=currency,
            dt=dt,
            description=description,
            transfer_group_id=transfer_group_id,
        )
        session.add(in_tx)
        session.flush()

        session.refresh(out_tx)
        session.refresh(in_tx)

        return [_to_dto(out_tx), _to_dto(in_tx)]


def get_account_balance(account_id: int, currency: str = "RUB") -> int:
    """Текущий баланс счёта в копейках."""
    from sqlalchemy import func

    with session_scope() as session:
        total = (
            session.query(func.coalesce(func.sum(Transaction.amount_minor), 0))
            .filter(
                Transaction.account_id == account_id,
                Transaction.currency == currency,
            )
            .scalar()
        )
        return int(total)
