import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime

API_URL = "http://localhost:8000"

# 1. 頁面基礎設定 (最先執行)
st.set_page_config(
    page_title="AI-Expense Tracker", 
    page_icon="💰", 
    layout="wide"
)

# 2. 簡單且穩定的美化 CSS (不再使用複雜的 lC-CSS)
st.markdown("""
    <style>
    .main {
        background-color: #f5f7f9;
    }
    .stButton>button {
        width: 100%;
        border-radius: 10px;
        height: 3em;
        background-color: #4F46E5 !important;
        color: white !important;
        font-weight: bold;
    }
    .result-box {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        border: 1px solid #e0e0e0;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.05);
    }
    </style>
    """, unsafe_allow_html=True)

# 3. 標題區 (確保在最上方)
st.title("💰 AI 學生智能記帳系統")
st.subheader("利用 EasyOCR + Ollama Qwen2.5 實現全本地端自動化記帳")
st.markdown("---")

# 4. 數據獲取邏輯
try:
    res = requests.get(f"{API_URL}/expenses/")
    if res.status_code == 200:
        expenses_data = res.json()
        df_all = pd.DataFrame(expenses_data) if expenses_data else pd.DataFrame()
except:
    df_all = pd.DataFrame()
    st.error("❌ 後端連線失敗，請檢查 uvicorn 是否啟動")

# 5. 頂部分析儀表板 (修正後的邏輯)
if not df_all.empty:
    # 建立四個指標卡片
    m1, m2, m3, m4 = st.columns(4)
    total_amount = df_all['amount'].sum()
    
    m1.metric("總支出", f"${total_amount:,.0f}")
    m2.metric("紀錄筆數", f"{len(df_all)} 筆")
    
    try:
        top_cat = df_all.groupby('category')['amount'].sum().idxmax()
        m3.metric("主要支出", top_cat)
    except:
        m3.metric("主要支出", "無")
        
    avg_spend = total_amount / len(df_all)
    m4.metric("單筆平均", f"${avg_spend:,.0f}")

    # 繪製消費分佈圖
    st.markdown("#### 📊 消費分佈分析")
    fig = px.pie(df_all, values='amount', names='category', 
                 hole=0.4, 
                 color_discrete_sequence=px.colors.sequential.RdBu)
    fig.update_layout(margin=dict(l=20, r=20, t=20, b=20), height=300)
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("目前尚無紀錄，快來試試 AI 辨識吧！")

st.markdown("---")

# 6. 功能分頁
tab1, tab2, tab3 = st.tabs(["📸 AI 自動記帳", "✍️ 手動輸入", "⚙️ 系統原理解析"])

with tab1:
    col_img, col_res = st.columns([1, 1], gap="large")
    with col_img:
        st.markdown("#### 📤 上傳收據圖片")
        uploaded_file = st.file_uploader("支援 JPG, PNG, JPEG", type=["jpg", "png", "jpeg"])
        if uploaded_file:
            st.image(uploaded_file, use_container_width=True)

    with col_res:
        st.markdown("#### 🤖 AI 分析結果")
        if uploaded_file:
            if st.button("啟動 AI 辨識 ✨"):
                with st.spinner("AI 正在解析資料..."):
                    files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                    try:
                        res = requests.post(f"{API_URL}/upload-receipt/", files=files)
                        if res.status_code == 200:
                            result = res.json()["data"]
                            st.success("✅ 辨識成功！")
                            st.markdown(f"""
                            <div class="result-box">
                                <p><b>項目：</b> {result['item']}</p>
                                <p><b>金額：</b> ${result['amount']}</p>
                                <p><b>分類：</b> {result['category']}</p>
                            </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.error("辨識失敗")
                    except Exception as e:
                        st.error(f"連線錯誤: {e}")
        else:
            st.info("⬅️ 請先上傳圖片")

with tab2:
    st.markdown("#### ✍️ 手動新增紀錄")
    with st.form("expense_form", clear_on_submit=True):
        c1, c2, c3 = st.columns(3)
        with c1: item = st.text_input("項目名稱", placeholder="例如：午餐")
        with c2: amount = st.number_input("金額", min_value=0.0, step=10.0)
        with c3: category = st.selectbox("分類", ["食物", "交通", "娛樂", "學習", "其他"])
        if st.form_submit_button("儲存紀錄 ➕"):
            if item:
                requests.post(f"{API_URL}/expenses/", json={"item": item, "amount": amount, "category": category})
                st.toast("✅ 已儲存！")
                st.rerun()
            else:
                st.warning("請填寫項目名稱")

with tab3:
    st.markdown("#### 🛠️ 本系統技術架構")
    st.markdown("""
    本專案實現了 **全本地端 AI (Local AI)** 記帳流程，確保數據隱私。
    
    **流程：** `圖片` $\rightarrow$ `EasyOCR` $\rightarrow$ `Ollama Qwen2.5` $\rightarrow$ `SQLite` $\rightarrow$ `Streamlit`
    """)

st.markdown("---")
st.subheader("📝 消費歷史清單")
if not df_all.empty:
    st.dataframe(df_all[["id", "created_at", "category", "item", "amount"]], use_container_width=True, hide_index=True)
else:
    st.info("目前沒有任何記錄")