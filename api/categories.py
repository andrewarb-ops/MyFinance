

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from services.categories import (
    create_category as svc_create_category,
    list_categories as svc_list_categories,
    get_category_by_id as svc_get_category_by_id,
    update_category as svc_update_category,
    deactivate_category as svc_deactivate_category,
)

from api.schemas import CategoryCreate, CategoryOut, CategoryUpdate


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def read_categories(
    type: Optional[str] = Query(None, description="income / expense"),
    active_only: bool = Query(True, description="Только активные категории"),
):
    cats = svc_list_categories(type_=type, active_only=active_only)
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

@router.get("/{category_id}", response_model=CategoryOut)
def read_category(category_id: int):
    cat = svc_get_category_by_id(category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("/{category_id}", response_model=CategoryOut)
def update_category_api(category_id: int, data: CategoryUpdate):
    cat = svc_update_category(
        category_id=category_id,
        name=data.name,
        type_=data.type,
        parent_id=data.parent_id,
        is_active=data.is_active,
    )
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.delete("/{category_id}")
def delete_category(category_id: int):
    ok = svc_deactivate_category(category_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}