from typing import List

from fastapi import APIRouter, HTTPException

from db import session_scope
from services.transactions import (
    add_income as svc_add_income,
    add_expense as svc_add_expense,
    add_transfer as svc_add_transfer,
)
from api.schemas import TransactionCreate, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def read_transactions():
    from models.transaction import Transaction

    with session_scope() as db:
        txs = db.query(Transaction).order_by(Transaction.id).all()
        return txs


@router.post("", response_model=List[TransactionOut], status_code=201)
def create_transaction(data: TransactionCreate):
    if data.kind == "income":
        tx = svc_add_income(
            account_id=data.account_id,
            category_id=data.category_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        return [tx]

    elif data.kind == "expense":
        tx = svc_add_expense(
            account_id=data.account_id,
            category_id=data.category_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        return [tx]

    else:  # transfer
        if data.to_account_id is None:
            raise HTTPException(status_code=400, detail="to_account_id is required for transfer")

        txs = svc_add_transfer(
            from_account_id=data.account_id,
            to_account_id=data.to_account_id,
            amount_minor=data.amount_minor,
            dt=data.dt,
            description=data.description,
            currency=data.currency,
        )
        return txs
