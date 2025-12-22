import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

// --- 元件：AI 互動區塊 (支援 Gemini 2.5 Flash) ---
const AIGenerator = () => {
  const [userKey, setUserKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('在這裡輸入你想知道的韓國旅遊資訊，讓 AI 為你規劃專屬行程。');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentModel, setCurrentModel] = useState('');

  const handleGenerate = async () => {
    const trimmedKey = userKey.trim();

    if (!trimmedKey) {
      setError('❌ 請先輸入 API Key');
      return;
    }
    if (!prompt.trim()) {
      setError('❌ 請輸入問題');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      
      // 🌟 根據你的截圖，更新了 2025 年最新的模型清單
      // 優先順序：2.5 Flash -> 2.5 Flash-Lite -> 1.5 Flash (保底)
      const modelsToTry = [
        "gemini-2.5-flash",       // 截圖中的最新版
        "gemini-2.5-flash-lite",  // 截圖中的輕量版
        "gemini-2.5-pro",         // 截圖中的專業版
        "gemini-1.5-flash",       // 舊版保底
        "gemini-pro"              // 最舊版保底
      ];

      let finalResponse = null;
      let successModel = "";

      // 自動迴圈測試，直到找到一個能用的模型
      for (const modelName of modelsToTry) {
        try {
          console.log(`正在嘗試連接模型: ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const response = await model.generateContent(prompt);
          const responseResult = await response.response;
          finalResponse = responseResult.text();
          
          successModel = modelName;
          break; // 成功就跳出，不用再試舊的
        } catch (innerErr) {
          console.warn(`模型 ${modelName} 失敗:`, innerErr.message);
          // 繼續嘗試下一個
        }
      }

      if (finalResponse) {
        setCurrentModel(successModel);
        setResult(finalResponse);
      } else {
        throw new Error("無法連接任何模型 (404/403)。請確認您的 API Key 是否已開通 Gemini 2.5 權限，或嘗試申請新 Key。");
      }

    } catch (err) {
      console.error("API Error:", err);
      if (err.message.includes('API key')) {
        setError('❌ API Key 無效，請檢查是否複製完整。');
      } else {
        setError(`❌ 生成失敗：${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="row justify-content-center mb-5">
      <div className="col-md-11">
        <div className="ai-box">
          <h3 className="mb-4 text-center"><span className="me-2">🤖</span>智能韓國旅遊助手</h3>
          
          <div className="mb-3">
            <label className="form-label text-muted small">請輸入 Gemini API Key (支援 Gemini 2.5)：</label>
            <input 
              type="password" 
              className="form-control" 
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="貼上您的 API Key"
            />
          </div>

          <div className="input-group mb-4">
            <input 
              type="text" 
              className="form-control form-control-lg" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：推薦首爾弘大附近的燒肉店..." 
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} 
            />
            <button 
              className="btn btn-primary px-4" 
              onClick={handleGenerate}
              disabled={isLoading}
              style={{backgroundColor: 'var(--kr-blue)'}}
            >
              {isLoading ? '搜尋中...' : '詢問 AI'}
            </button>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {/* 結果顯示區：會顯示當前使用的模型版本 */}
          <div className="ai-output">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">✨ AI 建議結果：</h5>
              {currentModel && <span className="badge bg-success">使用模型: {currentModel}</span>}
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{result || "等待輸入中..."}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 元件：首頁 ---
const Home = () => (
  <div className="animate-in">
    <section className="hero-section text-center">
      <h2 className="display-5 fw-bold mb-3">你好，首爾！</h2>
      <p className="lead text-muted px-lg-5">
        「躺在床上耍廢追劇是人生中百分之80%的快樂，但在韓國街頭漫步是另外的20%。」
        <br />探索最正宗的韓系生活，從這裡開始。
      </p>
    </section>
    <AIGenerator />
  </div>
);

// --- 元件：美食分頁 ---
const FoodList = () => (
  <div className="row g-5 animate-in">
    <div className="col-md-7">
      <h3 className="pb-3 mb-4 fst-italic border-bottom">🍱 必吃美食清單</h3>
      
      <div className="mb-5">
        <img src="/food3.jpeg" className="img-fluid travel-img mb-3" alt="美食大圖" onError={(e) => e.target.style.display='none'} />
        <p>在明洞轉角發現的這家醬蟹，真的是此生難忘，濃郁的蟹黃配上熱騰騰的白飯...</p>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <img src="/food1.jpg" className="travel-img" alt="辣炒年糕" onError={(e) => e.target.style.display='none'} />
          <p className="text-center fw-bold">傳統辣炒年糕：₩3,500</p>
        </div>
        <div className="col-md-6 mb-4">
          <img src="/food2.jpg" className="travel-img" alt="炸雞" onError={(e) => e.target.style.display='none'} />
          <p className="text-center fw-bold">橋村炸雞：₩20,000</p>
        </div>
      </div>

      <div className="table-responsive travel-table">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">餐廳</th>
              <th>預估價格</th>
              <th className="text-center">推薦指數</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="ps-4 fw-bold">廣藏市場小吃</td>
              <td>₩12,000</td>
              <td className="text-center text-warning">⭐⭐⭐</td>
            </tr>
            <tr>
              <td className="ps-4 fw-bold">名品醬蟹</td>
              <td>₩35,000</td>
              <td className="text-center text-warning">⭐⭐⭐⭐⭐</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="col-md-5">
      <div className="p-4 bg-light rounded-4 shadow-sm sticky-top" style={{top: '20px'}}>
        <h4 className="fw-bold mb-3">關於我</h4>
        <p>台韓混血的視角，帶你看見不一樣的韓國。目前就讀於台師大科技系。</p>
        <hr />
        <h5 className="fw-bold mt-4">旅遊貼士</h5>
        <ul className="list-unstyled">
          <li className="mb-2">📍 下載 Naver Map 導航更精準</li>
          <li className="mb-2">📍 必備 WOWPASS 卡方便支付</li>
          <li className="mb-2">📍 韓幣匯率觀察：明洞大使館最划算</li>
        </ul>
      </div>
    </div>
  </div>
);

// --- 元件：愛好分頁 ---
const Hobby = () => (
  <div className="container py-5 text-center animate-in">
    <h2 className="mb-4 fw-bold fst-italic">My Collection & Hobby</h2>
    <div className="row justify-content-center">
      <div className="col-md-8">
        <p className="lead">除了旅遊，我也非常喜歡研究藝術與光影的變化...</p>
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mt-4">
          <img src="/monet.JPG" className="img-fluid" alt="莫內睡蓮" onError={(e) => e.target.src='https://placehold.co/600x400?text=No+Image'} />
          <div className="card-body bg-white">
            <p className="card-text text-muted">莫內呈現光影的方式總能讓人感到平靜。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- 主程式 ---
function App() {
  return (
    <Router>
      <div className="container">
        <header className="blog-header border-bottom mb-4">
          <div className="row flex-nowrap justify-content-between align-items-center">
            <div className="col-12 text-center">
              <Link to="/" className="text-decoration-none text-dark">
                <h1 className="display-4 fw-bold">🇰🇷 Korea Travel Diary</h1>
              </Link>
            </div>
          </div>
          <nav className="nav d-flex justify-content-center gap-4 gap-md-5 mt-3">
            <Link className="nav-link" to="/">首頁</Link>
            <Link className="nav-link" to="/food">首爾美食</Link>
            <Link className="nav-link" to="/hobby">個人愛好</Link>
          </nav>
        </header>

        <main className="mb-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/food" element={<FoodList />} />
            <Route path="/hobby" element={<Hobby />} />
          </Routes>
        </main>

        <footer className="py-5 mt-5 text-center text-muted border-top">
          <p className="mb-1">Built with React & Gemini API</p>
          <p className="small">© 2025 Yian Li - NTNU Technology</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;