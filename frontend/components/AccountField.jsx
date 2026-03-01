export default function AccountField({ label, name, value, isEdit, onChange }) {
  return (
    <div className="row mb-3">
      <label htmlFor={name} className="col-12 col-md-3 col-form-label">
        {label}:
      </label>
      <div className="col-12 col-md-9">
        <input
          type="text"
          className="form-control"
          id={name}
          name={name}
          value={value ?? ""}
          readOnly={!isEdit}
          onChange={isEdit ? onChange : undefined}
        />
      </div>
    </div>
  );
}
