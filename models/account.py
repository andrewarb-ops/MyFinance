from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from db.base import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)      # 'cash', 'card', ...
    currency = Column(String(3), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    # Новый столбец: полный номер или маскированный, как решишь
    card_number = Column(String(32), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)