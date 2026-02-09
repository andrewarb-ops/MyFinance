from typing import List



from services.accounts import (
    create_account as svc_create_account,
    list_accounts as svc_list_accounts,
    update_account as svc_update_account,
    delete_account as svc_delete_account,
)

from fastapi import APIRouter, Depends, HTTPException
from services.transactions import get_account_balance
from models.account import Account
from db import session_scope

from api.schemas import AccountCreate, AccountOut, AccountUpdate
from api.auth import get_current_user
from api.schemas import UserOut

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=List[AccountOut])
def read_accounts():
    accounts = svc_list_accounts(active_only=False)
    return accounts


@router.post("", response_model=AccountOut, status_code=201)
def create_account(data: AccountCreate):
    acc_dto = svc_create_account(
        name=data.name,
        type_=data.type,
        currency=data.currency,
        is_active=True,
        card_number=data.card_number,  # новое поле
    )
    return acc_dto


@router.patch("/{account_id}", response_model=AccountOut)
def update_account(account_id: int, data: AccountUpdate):
    acc_dto = svc_update_account(
        account_id=account_id,
        name=data.name,
        type_=data.type,
        currency=data.currency,
        card_number=data.card_number,
        is_active=data.is_active,
    )
    if acc_dto is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc_dto


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int):
    ok = svc_delete_account(account_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Account not found")


@router.get("/{account_id}/balance")
def get_balance(
    account_id: int,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Текущий баланс счёта в копейках + валюта.
    """
    with session_scope() as session:
        account = (
            session.query(Account)
            .filter(Account.id == account_id)
            .first()
        )
        if account is None:
            raise HTTPException(status_code=404, detail="Account not found")

        currency = account.currency  # читаем пока сессия жива

    balance_minor = get_account_balance(
        account_id=account_id,
        user_id=current_user.id,
    )

    return {
        "account_id": account_id,
        "balance_minor": balance_minor,
        "currency": currency,
    }


@router.get("/summary/balance")
def get_total_balance(
    currency: str = "RUB",
    current_user: UserOut = Depends(get_current_user),
):
    with session_scope() as session:
        accounts = (
            session.query(Account)
            .filter(Account.currency == currency, Account.is_active == True)
            .all()
        )

    total = sum(
        get_account_balance(a.id, currency, user_id=current_user.id)
        for a in accounts
    )
    return {
        "currency": currency,
        "total_balance_minor": total,
    }
