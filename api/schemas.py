from typing import Optional, List
from datetime import datetime, date

from pydantic import BaseModel, field_validator
from pydantic import ConfigDict  # pydantic v2


# ---------- Create-модели ----------

class AccountCreate(BaseModel):
    name: str
    type: str
    currency: str = "RUB"
    card_number: Optional[str] = None  # новый атрибут


class CategoryCreate(BaseModel):
    name: str
    type: str  # "income" / "expense"
    parent_id: Optional[int] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in {"income", "expense"}:
            raise ValueError("type must be 'income' or 'expense'")
        return v


class TransactionCreate(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount_minor: int
    dt: Optional[datetime] = None
    description: Optional[str] = None
    currency: str = "RUB"
    kind: str  # "income" / "expense" / "transfer"
    to_account_id: Optional[int] = None

    @field_validator("amount_minor")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("amount_minor must be > 0")
        return v

    @field_validator("kind")
    @classmethod
    def validate_kind(cls, v: str) -> str:
        if v not in {"income", "expense", "transfer"}:
            raise ValueError("kind must be 'income', 'expense' or 'transfer'")
        return v


# ---------- Update-модели ----------

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    card_number: Optional[str] = None
    is_active: Optional[bool] = None


class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    description: Optional[str] = None
    amount_minor: Optional[int] = None


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str


# ---------- Out-модели ----------

class AccountOut(BaseModel):
    id: int
    name: str
    type: str
    currency: str
    is_active: bool
    card_number: Optional[str] = None  # новый атрибут
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str  # "income" / "expense"
    parent_id: Optional[int] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TransactionOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    account_id: int
    kind: str  # "income" / "expense" / "transfer"
    category_id: Optional[int] = None
    amount_minor: int
    currency: str
    dt: Optional[datetime] = None
    description: Optional[str] = None
    transfer_group_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: int
    username: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None  # "income" / "expense"
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str | None) -> str | None:
        if v is not None and v not in {"income", "expense"}:
            raise ValueError("type must be 'income' or 'expense'")
        return v


# ---------- Dashboard-модели ----------

class DashboardSummaryOut(BaseModel):
    period: str  # "month" / "week" / "quarter" / "year"
    date_from: date
    date_to: date
    net_flow_minor: int
    income_minor: int
    expense_minor: int
    accounts_balance_minor: int
    currency: str = "RUB"


class DashboardTrendPoint(BaseModel):
    label: str  # например "Янв", "Фев", "Неделя 1"
    income_minor: int
    expense_minor: int


class DashboardTrendsOut(BaseModel):
    period: str
    date_from: date
    date_to: date
    points: List[DashboardTrendPoint]
    currency: str = "RUB"


class DashboardCategoryItem(BaseModel):
    category_id: int
    name: str
    amount_minor: int
    share: float  # 0.27 == 27%


class DashboardCategoriesOut(BaseModel):
    period: str
    date_from: date
    date_to: date
    total_amount_minor: int
    currency: str = "RUB"
    categories: List[DashboardCategoryItem]
