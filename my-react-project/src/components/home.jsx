import AIGenerator from '../components/AIGenerator';

const Home = () => {
  return (
    <div>
      <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
        <h1 className="display-4 fst-italic">Yian Li</h1>
        <p className="lead my-3">躺在床上耍廢追劇是人生中百分之80%的快樂</p>
      </div>

      <div className="row">
        <div className="col-md-8">
          <AIGenerator /> {/* 將 API 互動功能放在首頁最顯眼的地方 */}
        </div>
        <div className="col-md-4">
          <div className="p-4 mb-3 bg-body-tertiary rounded">
            <h4 className="fst-italic">About me</h4>
            <ul className="list-unstyled">
              <li>生日：93/02/13</li>
              <li>台韓混血</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;