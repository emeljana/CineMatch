import couchImg from '../../assets/couch.png';

function Sofa() {
  return (
    <div className="cinema-sofa-wrap" aria-hidden="true">
      <img src={couchImg} alt="" className="cinema-sofa-img" />
    </div>
  );
}

export default Sofa;
