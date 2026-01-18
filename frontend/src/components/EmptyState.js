function EmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="text-center p-4 border rounded bg-light">
      <h5 className="mb-2">{title}</h5>
      <p className="text-muted mb-3">{description}</p>

      {actionText && onAction && (
        <button className="btn btn-dark" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
