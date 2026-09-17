import { useState } from 'react';
import { X } from 'lucide-react';

export default function EntityModal({ title, fields, initialValues, submitLabel, busy, onSubmit, onClose }) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      const existing = initialValues[f.name];
      v[f.name] = existing === null || existing === undefined ? '' : String(existing);
    });
    return v;
  });
  const [formError, setFormError] = useState(null);

  const handleChange = (name, raw) => setValues((prev) => ({ ...prev, [name]: raw }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        setFormError(`${f.label} is required`);
        return;
      }
    }

    // Blank fields are omitted rather than sent as null: some optional fields
    // (e.g. sensor metric/unit) have a non-nullable type with a server-side
    // default, so an explicit null would fail validation. Omitting lets create
    // fall back to that default, and update leave the existing value as-is.
    const payload = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (raw === '') continue;
      payload[f.name] = f.type === 'number' ? Number(raw) : raw;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fields.map((f) => (
              <div className="form-field" key={f.name}>
                <label htmlFor={f.name}>
                  {f.label}
                  {f.required && ' *'}
                </label>
                <input
                  id={f.name}
                  type={f.type === 'number' ? 'number' : 'text'}
                  step={f.type === 'number' ? 'any' : undefined}
                  value={values[f.name]}
                  placeholder={f.placeholder}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              </div>
            ))}
            {formError && <div className="form-error">{formError}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
