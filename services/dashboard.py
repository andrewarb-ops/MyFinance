from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Literal

from sqlalchemy import case, func, select

from db import session_scope
from models.account import Account
from models.category import Category
from models.transaction import Transaction


PeriodType = Literal["day", "week", "month", "quarter", "year"]


@dataclass
class DateRange:
    date_from: date
    date_to: date


def _get_period_range(period: PeriodType, base_date: date) -> DateRange:
    if period == "day":
        return DateRange(date_from=base_date, date_to=base_date)

    if period == "week":
        # считаем понедельник началом недели
        start = base_date - timedelta(days=base_date.weekday())
        end = start + timedelta(days=6)
        return DateRange(date_from=start, date_to=end)

    if period == "month":
        start = base_date.replace(day=1)
        if start.month == 12:
            end = start.replace(
                year=start.year + 1,
                month=1,
                day=1,
            ) - timedelta(days=1)
        else:
            end = start.replace(
                month=start.month + 1,
                day=1,
            ) - timedelta(days=1)
        return DateRange(date_from=start, date_to=end)

    if period == "quarter":
        quarter = (base_date.month - 1) // 3  # 0..3
        start_month = quarter * 3 + 1
        start = base_date.replace(month=start_month, day=1)
        if start_month == 10:
            end = start.replace(
                year=start.year + 1,
                month=1,
                day=1,
            ) - timedelta(days=1)
        else:
            end = start.replace(
                month=start_month + 3,
                day=1,
            ) - timedelta(days=1)
        return DateRange(date_from=start, date_to=end)

    if period == "year":
        start = base_date.replace(month=1, day=1)
        end = base_date.replace(month=12, day=31)
        return DateRange(date_from=start, date_to=end)

    raise ValueError(f"Unsupported period: {period}")


def _base_tx_query(session, drange: DateRange):
    return (
        session.query(Transaction)
        .filter(
            Transaction.dt
            >= datetime.combine(drange.date_from, datetime.min.time()),
            Transaction.dt
            <= datetime.combine(drange.date_to, datetime.max.time()),
        )
    )


def get_summary(
    period: PeriodType,
    base_date: date,
    user_id: int,
    currency: str = "RUB",
) -> dict:
    """
    Агрегаты для верхних карточек:
    чистый поток, доходы, расходы, суммарный баланс активных счетов.
    Переводы между счетами не учитываются.
    """
    drange = _get_period_range(period, base_date)

    with session_scope() as session:
        q = _base_tx_query(session, drange).filter(
            Transaction.user_id == user_id,
            Transaction.currency == currency,
            Transaction.transfer_group_id.is_(None),  # исключаем переводы
        )

        subq = q.with_entities(Transaction.id).subquery()

        income_sum = (
            session.query(
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.amount_minor > 0,
                             Transaction.amount_minor),
                            else_=0,
                        ),
                    ),
                    0,
                ),
            )
            .filter(Transaction.id.in_(select(subq.c.id)))
            .scalar()
        )

        expense_sum = (
            session.query(
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.amount_minor < 0,
                             -Transaction.amount_minor),
                            else_=0,
                        ),
                    ),
                    0,
                ),
            )
            .filter(Transaction.id.in_(select(subq.c.id)))
            .scalar()
        )

        net_flow = int(income_sum) - int(expense_sum)

        # общий баланс активных счетов (баланс считаем по всем операциям,
        # включая переводы, чтобы баланс по счёту был честный)
        accounts_subq = (
            session.query(Account.id)
            .filter(
                Account.is_active == True,  # noqa: E712
                Account.currency == currency,
            )
            .subquery()
        )

        balance_sum = (
            session.query(
                func.coalesce(func.sum(Transaction.amount_minor), 0),
            )
            .filter(
                Transaction.account_id.in_(select(accounts_subq.c.id)),
                Transaction.currency == currency,
                Transaction.user_id == user_id,
            )
            .scalar()
        )

        return {
            "period": period,
            "date_from": drange.date_from,
            "date_to": drange.date_to,
            "income_minor": int(income_sum),
            "expense_minor": int(expense_sum),
            "net_flow_minor": int(net_flow),
            "accounts_balance_minor": int(balance_sum),
            "currency": currency,
        }


def get_trends(
    period: PeriodType,
    base_date: date,
    user_id: int,
    currency: str = "RUB",
) -> dict:
    """
    Точки для графика доходов/расходов.
    day/week/month – разбивка по дням, quarter/year – по месяцам.
    Переводы не входят в расчёт.
    """
    drange = _get_period_range(period, base_date)

    with session_scope() as session:
        if period in ("day", "week", "month"):
            # разбивка по дням
            q = (
                session.query(
                    func.date(Transaction.dt).label("d"),
                    func.coalesce(
                        func.sum(
                            case(
                                (Transaction.amount_minor > 0,
                                 Transaction.amount_minor),
                                else_=0,
                            ),
                        ),
                        0,
                    ).label("income"),
                    func.coalesce(
                        func.sum(
                            case(
                                (Transaction.amount_minor < 0,
                                 -Transaction.amount_minor),
                                else_=0,
                            ),
                        ),
                        0,
                    ).label("expense"),
                )
                .filter(
                    Transaction.dt
                    >= datetime.combine(
                        drange.date_from,
                        datetime.min.time(),
                    ),
                    Transaction.dt
                    <= datetime.combine(
                        drange.date_to,
                        datetime.max.time(),
                    ),
                    Transaction.user_id == user_id,
                    Transaction.currency == currency,
                    Transaction.transfer_group_id.is_(None),  # исключаем переводы
                )
                .group_by(func.date(Transaction.dt))
                .order_by(func.date(Transaction.dt))
            )

            rows = q.all()
            points = []
            for r in rows:
                # SQLite часто отдаёт date как строку
                if isinstance(r.d, str):
                    d = datetime.strptime(r.d, "%Y-%m-%d").date()
                else:
                    d = r.d
                points.append(
                    {
                        "label": d.strftime("%d.%m"),
                        "income_minor": int(r.income),
                        "expense_minor": int(r.expense),
                    },
                )
        else:
            # year/quarter – помесячная разбивка
            q = (
                session.query(
                    func.strftime("%Y-%m-01", Transaction.dt).label("m"),
                    func.coalesce(
                        func.sum(
                            case(
                                (Transaction.amount_minor > 0,
                                 Transaction.amount_minor),
                                else_=0,
                            ),
                        ),
                        0,
                    ).label("income"),
                    func.coalesce(
                        func.sum(
                            case(
                                (Transaction.amount_minor < 0,
                                 -Transaction.amount_minor),
                                else_=0,
                            ),
                        ),
                        0,
                    ).label("expense"),
                )
                .filter(
                    Transaction.dt
                    >= datetime.combine(
                        drange.date_from,
                        datetime.min.time(),
                    ),
                    Transaction.dt
                    <= datetime.combine(
                        drange.date_to,
                        datetime.max.time(),
                    ),
                    Transaction.user_id == user_id,
                    Transaction.currency == currency,
                    Transaction.transfer_group_id.is_(None),  # исключаем переводы
                )
                .group_by("m")
                .order_by("m")
            )

            rows = q.all()
            points = []
            for r in rows:
                d = datetime.strptime(r.m, "%Y-%m-01").date()
                label = d.strftime("%b")  # Jan, Feb... (потом можно локализовать)
                points.append(
                    {
                        "label": label,
                        "income_minor": int(r.income),
                        "expense_minor": int(r.expense),
                    },
                )

        return {
            "period": period,
            "date_from": drange.date_from,
            "date_to": drange.date_to,
            "points": points,
            "currency": currency,
        }


def get_categories_summary(
    period: PeriodType,
    base_date: date,
    user_id: int,
    currency: str = "RUB",
    limit: int = 5,
) -> dict:
    """
    Данные для круговой диаграммы и топ-таблицы категорий (только расходы).
    Переводы не учитываются.
    """
    drange = _get_period_range(period, base_date)

    with session_scope() as session:
        q = (
            session.query(
                Category.id.label("category_id"),
                Category.name.label("name"),
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.amount_minor < 0,
                             -Transaction.amount_minor),
                            else_=0,
                        ),
                    ),
                    0,
                ).label("amount"),
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .filter(
                Transaction.dt
                >= datetime.combine(
                    drange.date_from,
                    datetime.min.time(),
                ),
                Transaction.dt
                <= datetime.combine(
                    drange.date_to,
                    datetime.max.time(),
                ),
                Transaction.user_id == user_id,
                Transaction.currency == currency,
                Transaction.amount_minor < 0,
                Transaction.transfer_group_id.is_(None),  # только реальные расходы
            )
            .group_by(Category.id, Category.name)
            # самые большие расходы (amount отрицательный в Transaction,
            # но мы уже перевернули знак в case, сортируем по сумме по возрастанию)
            .order_by(func.sum(Transaction.amount_minor))
        )

        rows = q.all()

        total_expense = sum(int(r.amount) for r in rows)
        if total_expense == 0:
            categories = []
        else:
            categories = []
            for r in rows[:limit]:
                amount = int(r.amount)
                share = amount / total_expense if total_expense > 0 else 0
                categories.append(
                    {
                        "category_id": r.category_id,
                        "name": r.name,
                        "amount_minor": amount,
                        "share": float(share),
                    },
                )

        return {
            "period": period,
            "date_from": drange.date_from,
            "date_to": drange.date_to,
            "total_amount_minor": int(total_expense),
            "currency": currency,
            "categories": categories,
        }

def get_income_categories_summary(
    period: PeriodType,
    base_date: date,
    user_id: int,
    currency: str = "RUB",
    limit: int = 5,
) -> dict:
    """
    Данные для круговой диаграммы и топ-таблицы категорий (только доходы).
    Переводы не учитываются.
    """
    drange = _get_period_range(period, base_date)

    with session_scope() as session:
        q = (
            session.query(
                Category.id.label("category_id"),
                Category.name.label("name"),
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.amount_minor > 0,
                             Transaction.amount_minor),
                            else_=0,
                        ),
                    ),
                    0,
                ).label("amount"),
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .filter(
                Transaction.dt
                >= datetime.combine(
                    drange.date_from,
                    datetime.min.time(),
                ),
                Transaction.dt
                <= datetime.combine(
                    drange.date_to,
                    datetime.max.time(),
                ),
                Transaction.user_id == user_id,
                Transaction.currency == currency,
                Transaction.amount_minor > 0,
                Transaction.transfer_group_id.is_(None),  # только реальные доходы
            )
            .group_by(Category.id, Category.name)
            # самые большие доходы (сортируем по сумме по убыванию)
            .order_by(func.sum(Transaction.amount_minor).desc())
        )

        rows = q.all()

        total_income = sum(int(r.amount) for r in rows)
        if total_income == 0:
            categories = []
        else:
            categories = []
            for r in rows[:limit]:
                amount = int(r.amount)
                share = amount / total_income if total_income > 0 else 0
                categories.append(
                    {
                        "category_id": r.category_id,
                        "name": r.name,
                        "amount_minor": amount,
                        "share": float(share),
                    },
                )

        return {
            "period": period,
            "date_from": drange.date_from,
            "date_to": drange.date_to,
            "total_amount_minor": int(total_income),
            "currency": currency,
            "categories": categories,
        }
