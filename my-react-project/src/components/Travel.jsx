import React from 'react';

const Travel = () => {
  return (
    <div className="row g-5">
      <div className="col-md-8">
        <h2 className="display-5 link-body-emphasis mb-1">Travel</h2>
        <p className="blog-post-meta">December 23, 2023</p>
        <p>為期三個禮拜的韓國之旅，買買買吃吃吃！</p>
        
        <table className="table mt-4">
          <thead className="table-light">
            <tr><th>餐廳名字</th><th>價格</th><th>推薦指數</th></tr>
          </thead>
          <tbody>
            <tr><td>廣藏市場小吃</td><td>約台幣300元</td><td>⭐️⭐️⭐️</td></tr>
            <tr><td>醬蟹名店</td><td>900/人</td><td>⭐️⭐️⭐️⭐️⭐️</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Travel;