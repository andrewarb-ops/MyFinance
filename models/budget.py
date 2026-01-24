from sqlalchemy import Column, Integer, Date, ForeignKey
from db.base import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    amount_minor = Column(Integer, nullable=False)  # лимит в копейках