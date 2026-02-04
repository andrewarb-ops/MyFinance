from datetime import date
from typing import Optional

from fastapi import APIRouter, Query

from api.schemas import (
    DashboardSummaryOut,
    DashboardTrendsOut,
    DashboardCategoriesOut,
    # добавим позже, если сделаем отдельную схему
    # DashboardIncomeCategoriesOut,
)
from services.dashboard import (
    get_summary,
    get_trends,
    get_categories_summary,
    get_income_categories_summary,  # ← вот это
)



router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _normalize_period(period: str) -> str:
    allowed = {"day", "week", "month", "quarter", "year"}
    if period not in allowed:
        raise ValueError(f"Unsupported period: {period}")
    return period


@router.get("/summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    period: str = Query("month"),
    base_date: Optional[date] = Query(None, description="Базовая дата внутри периода"),
    currency: str = Query("RUB"),
):
    """
    Карточки: чистый поток, доходы, расходы, общий баланс счетов.
    """
    period_norm = _normalize_period(period)
    base_date = base_date or date.today()

    data = get_summary(period_norm, base_date, currency=currency)
    return DashboardSummaryOut(**data)


@router.get("/trends", response_model=DashboardTrendsOut)
def dashboard_trends(
    period: str = Query("month"),
    base_date: Optional[date] = Query(None),
    currency: str = Query("RUB"),
):
    """
    Линейный график динамики доходов и расходов.
    """
    period_norm = _normalize_period(period)
    base_date = base_date or date.today()

    data = get_trends(period_norm, base_date, currency=currency)
    return DashboardTrendsOut(**data)


@router.get("/categories", response_model=DashboardCategoriesOut)
def dashboard_categories(
    period: str = Query("month"),
    base_date: Optional[date] = Query(None),
    currency: str = Query("RUB"),
    limit: int = Query(5, ge=1, le=50),
):
    """
    Круговая диаграмма и топ категорий по расходам.
    """
    period_norm = _normalize_period(period)
    base_date = base_date or date.today()

    data = get_categories_summary(
        period_norm,
        base_date,
        currency=currency,
        limit=limit,
    )
    return DashboardCategoriesOut(**data)


@router.get("/income_categories", response_model=DashboardCategoriesOut)
def dashboard_income_categories(
    period: str = Query("month"),
    base_date: Optional[date] = Query(None),
    currency: str = Query("RUB"),
    limit: int = Query(5, ge=1, le=50),
):
    """
    Круговая диаграмма и топ категорий по доходам.
    """
    period_norm = _normalize_period(period)
    base_date = base_date or date.today()

    data = get_income_categories_summary(
        period_norm,
        base_date,
        currency=currency,
        limit=limit,
    )
    return DashboardCategoriesOut(**data)