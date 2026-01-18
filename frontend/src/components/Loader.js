function Loader({ text = "Loading..." }) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "200px" }}
    >
      <div className="spinner-border text-dark mb-2" role="status" />
      <span className="text-muted">{text}</span>
    </div>
  );
}

export default Loader;
