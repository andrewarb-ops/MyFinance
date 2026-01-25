from typing import List

from fastapi import APIRouter, HTTPException

from services.accounts import (
    create_account as svc_create_account,
    list_accounts as svc_list_accounts,
    update_account as svc_update_account,
    delete_account as svc_delete_account,
)

from api.schemas import AccountCreate, AccountOut, AccountUpdate

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
