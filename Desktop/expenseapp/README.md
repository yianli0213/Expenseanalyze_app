# AI 學生智能記帳系統 (Local AI Expense Tracker)

這是一個專為學生設計的智能記帳應用程式，核心特色在於 **「全本地端運行」**。系統結合了 OCR 技術與大語言模型 (LLM)，能自動將收據圖片轉換為結構化記帳資料，同時確保使用者的財務隱私完全不外流。

## 核心特性
- **全本地端 AI：** 所有運算均在使用者本地電腦完成，無需雲端 API，確保數據隱私。
- **AI 自動辨識：** 整合 `EasyOCR` 與 `Ollama`，實現從圖片 $\rightarrow$ 文字 $\rightarrow$ JSON 的自動化流程。
- **數據可視化：** 內建消費分佈分析圓餅圖，幫助使用者掌握支出趨勢。
- **極簡操作：** 提供拍照上傳與手動輸入雙模式，滿足不同記帳習慣。

##  技術棧 (Tech Stack)
- **前端：** Streamlit (Python)
- **後端：** FastAPI (Python)
- **資料庫：** SQLite + SQLAlchemy
- **AI 引擎：** 
  - 文字擷取：`EasyOCR`
  - 結構化處理：`Ollama` (運行 `Qwen2.5:3b` 模型)
- **視覺化：** Plotly

## 快速啟動指南

### 1. 環境準備
- 安裝 [Ollama](https://ollama.ai/)
- 下載模型：`ollama pull qwen2.5:3b`
- 安裝 Python 3.10+

### 2. 安裝步驟
```bash
# 複製專案
git clone https://github.com/YOUR_USERNAME/ai-student-expense-tracker.git
cd ai-student-expense-tracker

# 建立並啟動虛擬環境
python3 -m venv venv
source venv/bin/activate

# 安裝依賴套件
pip install -r requirements.txt
```

### 3. 執行方式
- **啟動後端：** `uvicorn main:app --reload`
- **啟動前端：** `streamlit run app.py`

## 📐 系統架構
`圖片上傳` $\rightarrow$ `EasyOCR (文字擷取)` $\rightarrow$ `Ollama Qwen2.5 (JSON 結構化)` $\rightarrow$ `SQLite (儲存)` $\rightarrow$ `Streamlit (呈現)`