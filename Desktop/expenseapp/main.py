import io
import json
import re
import requests
import easyocr
from PIL import Image
from fastapi import FastAPI, Depends, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import database

# 自動建立資料庫與資料表
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 取得資料庫連線 (修正：移除重複定義)
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 本地端開源模型 (修正：easyocr 拼字錯誤 & 補上引號)
reader = easyocr.Reader(['ch_tra', 'en'])

def parse_receipt_with_ollama(image_bytes):
    # 步驟一：用 EasyOCR 把圖片轉成文字
    image = Image.open(io.BytesIO(image_bytes))
    result = reader.readtext(image, detail=0)
    full_text = " ".join(result)
    print("👉 OCR 抓到的字:", full_text) 
    
    # 步驟二：交給本地端 Ollama 整理成 JSON
    prompt = f"""
    這是一張發票或收據的辨識結果：{full_text}
    請幫我抓出商品名稱、總金額、分類，並嚴格只輸出 JSON 格式。
    必須包含以下三個 key：
    - "item": 商品名稱
    - "amount": 總金額 (純數字)
    - "category": 分類 (只能從 食物、交通、娛樂、學習、其他 中選出一個)
    """   

    try:
        # 呼叫 Ollama (修正：修正縮排)
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:3b", 
            "prompt": prompt,
            "stream": False,
            "format": "json"
        })

        ai_response = res.json()["response"]

        # 嘗試從回應中提取 JSON 部分
        match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        else:
            return json.loads(ai_response) 

    except Exception as e:
        print("❌ Ollama 呼叫失敗:", e)
        return {"item": "未命名", "amount": 0.0, "category": "其他"}

# =========== 2. 定義資料格式 ===========
class ExpenseCreate(BaseModel):
    item: str
    amount: float
    category: str

# =========== 3. 所有 API 路由 ===========

# 修正：拼字 upload_receipt, 移除 def 後面的點, 修正函數名稱呼叫
@app.post("/upload-receipt/")
async def upload_receipt(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()

    # 呼叫辨識函數 (修正：拼字 parse_receipt_with_ollama)
    data = parse_receipt_with_ollama(image_bytes)

    # 將辨識結果存入資料庫 (修正：database.Expense, 修正 get 拼字, 補上逗號)
    db_expense = database.Expense(
        item=data.get("item", "未命名"),
        amount=float(data.get("amount", 0.0)),
        category=data.get("category", "其他")
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    return {"message": "辨識成功！", "data": db_expense}

# API B: 手動新增記帳紀錄
@app.post("/expenses/")
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = database.Expense(
        item=expense.item, 
        amount=expense.amount, 
        category=expense.category
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# API C: 取得所有記帳紀錄
@app.get("/expenses/")
def read_expenses(db: Session = Depends(get_db)):
    return db.query(database.Expense).all()