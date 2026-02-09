from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
#from sqlalchemy.orm import relationship
from db.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, nullable=True)
   # category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    amount_minor = Column(Integer, nullable=False)  # сумма в копейках, +доход, -расход
    currency = Column(String(3), nullable=False)

    dt = Column(DateTime, nullable=False)           # дата/время операции
    description = Column(Text)

    transfer_group_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    #account = relationship("Account")
    #category = relationship("Category")
