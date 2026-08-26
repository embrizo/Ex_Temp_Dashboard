import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import EntityModal from './EntityModal';
import ConfirmDialog from './ConfirmDialog';

export default function HierarchyListPage({
  breadcrumbItems,
  heading,
  addLabel,
  fields,
  items,
  loading,
  error,
  reload,
  onCreate,
  onUpdate,
  onDelete,
  itemLink,
  renderSubtitle,
  emptyMessage,
}) {
  const [modalItem, setModalItem] = useState(undefined); // undefined = closed, null = create, object = edit
  const [confirmItem, setConfirmItem] = useState(null);
  const [busy, setBusy] = useState(false);

  const closeModal = () => setModalItem(undefined);

  const handleSubmit = async (values) => {
    setBusy(true);
    try {
      if (modalItem) {
        await onUpdate(modalItem.id, values);
      } else {
        await onCreate(values);
      }
      closeModal();
      reload();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(confirmItem.id);
      setConfirmItem(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <Breadcrumb items={breadcrumbItems} />

        <div className="hierarchy-page-header">
          <h1>{heading}</h1>
          <button className="btn btn-primary" onClick={() => setModalItem(null)}>
            <Plus size={16} /> {addLabel}
          </button>
        </div>

        {loading && (
          <div className="hierarchy-loading">
            <Loader2 className="spin" size={20} /> Loading…
          </div>
        )}
        {error && <div className="hierarchy-error">Failed to load: {error}</div>}
        {!loading && !error && items?.length === 0 && (
          <div className="hierarchy-empty">{emptyMessage}</div>
        )}

        <div className="hierarchy-grid">
          {items?.map((item) => {
            const body = (
              <>
                <div className="hierarchy-card-name">{item.name}</div>
                {renderSubtitle?.(item) && (
                  <div className="hierarchy-card-sub">{renderSubtitle(item)}</div>
                )}
              </>
            );

            return (
              <div className="hierarchy-card glass-card" key={item.id}>
                {itemLink ? (
                  <Link to={itemLink(item)} className="hierarchy-card-body">
                    {body}
                  </Link>
                ) : (
                  <div className="hierarchy-card-body">{body}</div>
                )}
                <div className="hierarchy-card-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                    onClick={() => setModalItem(item)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="Delete"
                    onClick={() => setConfirmItem(item)}
                  >
                    <Trash2 size={14} />
                  </button>
                  {itemLink && <ChevronRight size={16} className="hierarchy-card-chevron" />}
                </div>
              </div>
            );
          })}
        </div>

        {modalItem !== undefined && (
          <EntityModal
            title={modalItem ? `Edit ${heading.replace(/s$/, '')}` : addLabel}
            fields={fields}
            initialValues={modalItem || {}}
            submitLabel={modalItem ? 'Save' : 'Create'}
            busy={busy}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}

        {confirmItem && (
          <ConfirmDialog
            title={`Delete "${confirmItem.name}"?`}
            message="This will also delete everything underneath it. This cannot be undone."
            confirmLabel="Delete"
            busy={busy}
            onConfirm={handleDelete}
            onCancel={() => setConfirmItem(null)}
          />
        )}
      </div>
    </div>
  );
}
