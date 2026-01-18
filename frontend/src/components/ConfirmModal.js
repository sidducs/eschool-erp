function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      ></div>

      {/* MODAL */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1050 }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
              ></button>
            </div>

            <div className="modal-body">
              <p>{message}</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmModal;
