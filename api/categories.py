from typing import List

from fastapi import APIRouter

from services.categories import (
    create_category as svc_create_category,
    list_categories as svc_list_categories,
)
from api.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def read_categories():
    cats = svc_list_categories(type_=None, active_only=False)
    return cats


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate):
    cat_dto = svc_create_category(
        name=data.name,
        type_=data.type,
        parent_id=data.parent_id,
        is_active=True,
    )
    return cat_dto
