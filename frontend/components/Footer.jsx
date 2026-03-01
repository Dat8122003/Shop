const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container d-flex flex-column align-items-center">
        <h5 className="fw-bold mb-3">Shop Demo</h5>
        <div className="d-flex gap-4 mb-2">
          <a
            className="text-decoration-none link-light opacity-75 opacity-100-hover"
            href="#mota"
          >
            Mô tả
          </a>
          <a
            className="text-decoration-none link-light opacity-75 opacity-100-hover"
            href="#lienhe"
          >
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
