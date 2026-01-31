# api/transactions.py

from typing import List

from fastapi import APIRouter, HTTPException

from services.transactions import (
    add_income as svc_add_income,
    add_expense as svc_add_expense,
    add_transfer as svc_add_transfer,
    delete_transaction as svc_delete_transaction,
    list_transactions as svc_list_transactions,
)

from api.schemas import TransactionCreate, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def read_transactions():
    """Получить список всех транзакций."""
    txs = svc_list_transactions()
    return [TransactionOut.model_validate(tx) for tx in txs]


@router.post("", response_model=List[TransactionOut], status_code=201)
def create_transaction(data: TransactionCreate):
    """Создать новую транзакцию (доход, расход или перевод)."""
    try:
        if data.kind == "income":
            tx = svc_add_income(
                account_id=data.account_id,
                category_id=data.category_id,
                amount_minor=data.amount_minor,
                dt=data.dt,
                description=data.description,
                currency=data.currency,
            )
            return [TransactionOut.model_validate(tx)]

        elif data.kind == "expense":
            tx = svc_add_expense(
                account_id=data.account_id,
                category_id=data.category_id,
                amount_minor=data.amount_minor,
                dt=data.dt,
                description=data.description,
                currency=data.currency,
            )
            return [TransactionOut.model_validate(tx)]

        else:  # transfer
            if data.to_account_id is None:
                raise HTTPException(
                    status_code=400, detail="to_account_id is required for transfer"
                )

            txs = svc_add_transfer(
                from_account_id=data.account_id,
                to_account_id=data.to_account_id,
                amount_minor=data.amount_minor,
                dt=data.dt,
                description=data.description,
                currency=data.currency,
            )
            return [TransactionOut.model_validate(tx) for tx in txs]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int):
    deleted = svc_delete_transaction(transaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")