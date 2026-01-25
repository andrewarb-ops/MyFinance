from typing import List

from fastapi import APIRouter

from services.accounts import (
    create_account as svc_create_account,
    list_accounts as svc_list_accounts,
)
from api.schemas import AccountCreate, AccountOut

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
