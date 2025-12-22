import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import './AIGenerator.css'; // 引入剛剛建立的 CSS 檔案

// ⚠️ 請確保您的 .env.local 檔案已設定 VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const AIGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('在這裡輸入你想讓 AI 幫您完成的任務，例如：寫一篇關於韓國美食的文章。');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateContent = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('請輸入您的提示文字。');
            return;
        }

        if (!ai) {
            setError('API 金鑰未設定，請檢查 .env.local 檔案。');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(''); // 清空舊結果

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            if (response.text) {
                setResult(response.text);
            } else {
                setResult('AI 未能生成有效的內容。');
            }

        } catch (err) {
            console.error("API 錯誤:", err);
            // 處理 API 錯誤 (如金鑰無效或請求限制)
            setError(`內容生成失敗。錯誤細節：${err.message || '請檢查 API 金鑰與網路連線。'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-container">
            <h3>🤖 AI 互動區 (Gemini 文字生成)</h3>
            <form onSubmit={generateContent}>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="輸入提示文字，如：給我一個 React 專案的點子"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '生成中...' : '開始生成'}
                </button>
            </form>

            {/* 錯誤狀態顯示 */}
            {error && <p className="error-message">❌ 錯誤：{error}</p>}
            
            {/* Loading 狀態顯示 */}
            {isLoading && <div className="loading-spinner"></div>}

            {/* 結果顯示 (使用 pre-wrap 保留換行格式) */}
            {!isLoading && result && (
                <div className="result-output">
                    <h4>✅ 生成結果：</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
                </div>
            )}
        </div>
    );
};

export default AIGenerator;