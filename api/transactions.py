# api/transactions.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException

from db import session_scope
from services.transactions import (
    add_income as svc_add_income,
    add_expense as svc_add_expense,
    add_transfer as svc_add_transfer,
    delete_transaction as svc_delete_transaction,
    update_transaction as svc_update_transaction,  # ⚠️ см. ниже про сервис
)
from api.schemas import TransactionCreate, TransactionOut, TransactionUpdate
from models.transaction import Transaction
from api.auth import get_current_user
from api.schemas import UserOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _detect_kind(amount_minor: int, transfer_group_id: int | None) -> str:
    if transfer_group_id is not None:
        return "transfer"
    if amount_minor > 0:
        return "income"
    return "expense"


@router.get("", response_model=List[TransactionOut])
def read_transactions(current_user: UserOut = Depends(get_current_user)):
    # Берём ORM-объекты и сразу превращаем в dict, добавляя kind
    with session_scope() as db:
        txs = (
            db.query(Transaction)
            .filter(Transaction.user_id == current_user.id)
            .order_by(Transaction.id)
            .all()
        )
        rows: list[dict] = []
        for tx in txs:
            rows.append(
                {
                    "id": tx.id,
                    "user_id": tx.user_id,
                    "account_id": tx.account_id,
                    "category_id": tx.category_id,
                    "amount_minor": tx.amount_minor,
                    "currency": tx.currency,
                    "dt": tx.dt,
                    "description": tx.description,
                    "transfer_group_id": tx.transfer_group_id,
                    "created_at": tx.created_at,
                    "kind": _detect_kind(tx.amount_minor, tx.transfer_group_id),
                }
            )

    return [TransactionOut.model_validate(row) for row in rows]


@router.post("", response_model=List[TransactionOut], status_code=201)
def create_transaction(
    data: TransactionCreate,
    current_user: UserOut = Depends(get_current_user),
):
    # Доход
    if data.kind == "income":
        tx = svc_add_income(
            user_id=current_user.id,
            account_id=data.account_id,
            category_id=data.category_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        row = {
            "id": tx.id,
            "user_id": tx.user_id,
            "account_id": tx.account_id,
            "category_id": tx.category_id,
            "amount_minor": tx.amount_minor,
            "currency": tx.currency,
            "dt": tx.dt,
            "description": tx.description,
            "transfer_group_id": tx.transfer_group_id,
            "created_at": None,
            "kind": "income",
        }
        return [TransactionOut.model_validate(row)]

    # Расход
    if data.kind == "expense":
        tx = svc_add_expense(
            user_id=current_user.id,
            account_id=data.account_id,
            category_id=data.category_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        row = {
            "id": tx.id,
            "user_id": tx.user_id,
            "account_id": tx.account_id,
            "category_id": tx.category_id,
            "amount_minor": tx.amount_minor,
            "currency": tx.currency,
            "dt": tx.dt,
            "description": tx.description,
            "transfer_group_id": tx.transfer_group_id,
            "created_at": None,
            "kind": "expense",
        }
        return [TransactionOut.model_validate(row)]

    # Перевод
    if data.kind == "transfer":
        if data.to_account_id is None:
            raise HTTPException(
                status_code=400,
                detail="to_account_id is required for transfer",
            )

        txs = svc_add_transfer(
            user_id=current_user.id,
            from_account_id=data.account_id,
            to_account_id=data.to_account_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        rows: list[dict] = []
        for tx in txs:
            rows.append(
                {
                    "id": tx.id,
                    "user_id": tx.user_id,
                    "account_id": tx.account_id,
                    "category_id": tx.category_id,
                    "amount_minor": tx.amount_minor,
                    "currency": tx.currency,
                    "dt": tx.dt,
                    "description": tx.description,
                    "transfer_group_id": tx.transfer_group_id,
                    "created_at": None,
                    "kind": "transfer",
                }
            )
        return [TransactionOut.model_validate(row) for row in rows]

    raise HTTPException(status_code=400, detail="Invalid kind")


@router.patch("/{transaction_id}", response_model=TransactionOut)
def patch_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Обновляет категорию, описание и/или сумму транзакции.
    Логика обновления (включая переводы) реализована в сервисе.
    """
    tx = svc_update_transaction(
        transaction_id=transaction_id,
        user_id=current_user.id,
        category_id=data.category_id,
        description=data.description,
        amount_minor=data.amount_minor,  # 👈 прокидываем новую сумму
    )
    if tx is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    row = {
        "id": tx.id,
        "user_id": tx.user_id,
        "account_id": tx.account_id,
        "category_id": tx.category_id,
        "amount_minor": tx.amount_minor,
        "currency": tx.currency,
        "dt": tx.dt,
        "description": tx.description,
        "transfer_group_id": tx.transfer_group_id,
        "created_at": None,
        "kind": _detect_kind(tx.amount_minor, tx.transfer_group_id),
    }
    return TransactionOut.model_validate(row)

@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    current_user: UserOut = Depends(get_current_user),
):
    deleted = svc_delete_transaction(transaction_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
