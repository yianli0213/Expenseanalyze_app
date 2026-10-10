from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

# 設定 SQLite 資料庫檔案
SQLALCHEMY_DATABASE_URL = "sqlite:///./expenses.db"

# 建立連接引擎
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 定義記帳表單的 Schema
class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    item = Column(String, index=True)
    amount = Column(Float)
    category = Column(String)