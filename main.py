from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from api.accounts import router as accounts_router
from api.categories import router as categories_router
from api.transactions import router as transactions_router

from db import session_scope
from models.account import Account
from models.category import Category
from models.transaction import Transaction
from models.budget import Budget


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="myFinance API",
    description="Черновой API для отладки и работы через сервисный слой",
    version="0.2.0",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(accounts_router)
app.include_router(categories_router)
app.include_router(transactions_router)

templates = Jinja2Templates(directory="templates")


def account_to_dict(a: Account) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "type": a.type,
        "currency": a.currency,
        "is_active": a.is_active,
        "created_at": a.created_at,
    }


def category_to_dict(c: Category) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "type": c.type,
        "parent_id": c.parent_id,
        "is_active": c.is_active,
    }


def transaction_to_dict(t: Transaction) -> dict:
    return {
        "id": t.id,
        "account_id": t.account_id,
        "category_id": t.category_id,
        "amount_minor": t.amount_minor,
        "currency": t.currency,
        "dt": t.dt,
        "description": t.description,
        "transfer_group_id": t.transfer_group_id,
        "created_at": t.created_at,
    }


def budget_to_dict(b: Budget) -> dict:
    return {
        "id": b.id,
        "category_id": b.category_id,
        "period_start": b.period_start,
        "period_end": b.period_end,
        "amount_minor": b.amount_minor,
    }


@app.get("/db_view", response_class=HTMLResponse)
def db_view(request: Request):
    with session_scope() as db:
        accounts = [account_to_dict(a) for a in db.query(Account).order_by(Account.id)]
        categories = [category_to_dict(c) for c in db.query(Category).order_by(Category.id)]
        transactions = [transaction_to_dict(t) for t in db.query(Transaction).order_by(Transaction.id)]
        budgets = [budget_to_dict(b) for b in db.query(Budget).order_by(Budget.id)]

    return templates.TemplateResponse(
        "db_view.html",
        {
            "request": request,
            "accounts": accounts,
            "categories": categories,
            "transactions": transactions,
            "budgets": budgets,
        },
    )
