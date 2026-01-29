from typing import List, Optional, TypedDict

from db import session_scope
from models.category import Category


class CategoryDTO(TypedDict):
    id: int
    name: str
    type: str          # 'income' или 'expense'
    parent_id: Optional[int]
    is_active: bool


def _to_dto(cat: Category) -> CategoryDTO:
    return CategoryDTO(
        id=cat.id,
        name=cat.name,
        type=cat.type,
        parent_id=cat.parent_id,
        is_active=cat.is_active,
    )


def create_category(
    name: str,
    type_: str,                  # 'income' / 'expense'
    parent_id: Optional[int] = None,
    is_active: bool = True,
) -> CategoryDTO:
    """Создать категорию дохода/расхода."""
    if type_ not in ("income", "expense"):
        raise ValueError("type_ must be 'income' or 'expense'")

    with session_scope() as session:
        cat = Category(
            name=name,
            type=type_,
            parent_id=parent_id,
            is_active=is_active,
        )
        session.add(cat)
        session.flush()
        session.refresh(cat)
        return _to_dto(cat)


def list_categories(
    type_: Optional[str] = None,
    active_only: bool = True,
) -> List[CategoryDTO]:
    """Список категорий, с фильтрами по типу и активности."""
    with session_scope() as session:
        query = session.query(Category)
        if type_ is not None:
            query = query.filter(Category.type == type_)
        if active_only:
            query = query.filter(Category.is_active.is_(True))
        cats = query.order_by(Category.id).all()
        return [_to_dto(c) for c in cats]


def get_category_by_id(category_id: int) -> Optional[CategoryDTO]:
    """Найти категорию по id."""
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter(Category.id == category_id)
            .first()
        )
        if cat is None:
            return None
        return _to_dto(cat)


def deactivate_category(category_id: int) -> bool:
    """Пометить категорию как неактивную."""
    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter(Category.id == category_id)
            .first()
        )
        if cat is None:
            return False
        cat.is_active = False
        session.add(cat)
        return True


def update_category(
    category_id: int,
    *,
    name: Optional[str] = None,
    type_: Optional[str] = None,  # "income" / "expense"
    parent_id: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[CategoryDTO]:
    """Обновить категорию по id, изменяя только переданные поля."""

    if type_ is not None and type_ not in ("income", "expense"):
        raise ValueError("type_ must be 'income' or 'expense'")

    with session_scope() as session:
        cat = (
            session.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if cat is None:
            return None

        if name is not None:
            cat.name = name
        if type_ is not None:
            cat.type = type_
        if parent_id is not None:
            cat.parent_id = parent_id
        if is_active is not None:
            cat.is_active = is_active

        session.add(cat)
        session.flush()
        session.refresh(cat)

        return _to_dto(cat)