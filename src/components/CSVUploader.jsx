import { useData } from '../context/DataContext';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';

export default function CSVUploader({ onUploaded }) {
  const { parseCSV, isLoading, error, fileName, clearData, parseProgress } = useData();
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }
    parseCSV(file);
    if (onUploaded) onUploaded();
  }, [parseCSV, onUploaded]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  if (fileName && !isLoading) {
    return (
      <div className="glass-card card-glow-green" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={20} color="var(--color-green)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={12} /> Loaded successfully
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearData} style={{ flexShrink: 0 }}>
          <X size={14} /> Clear
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()} style={{ flexShrink: 0 }}>
          <Upload size={14} /> Replace
        </button>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`drop-zone ${dragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />

        {isLoading ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <Loader2 size={40} color="var(--color-cyan)" style={{ animation: 'spin-slow 1s linear infinite' }} />
            </div>
            <div className="drop-zone-title">Parsing CSV...</div>
            <div className="progress-bar" style={{ maxWidth: 300, margin: 'var(--space-4) auto 0' }}>
              <div className="progress-fill" style={{ width: `${parseProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="drop-zone-icon">📊</div>
            <div className="drop-zone-title">
              Drop CSV file here or <span style={{ color: 'var(--color-cyan)' }}>browse</span>
            </div>
            <div className="drop-zone-subtitle" style={{ marginTop: 8 }}>
              Supports TUAIRWASHER temperature logs · up to 50,000 rows
            </div>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="tag tag-cyan">TimeStamp</span>
              <span className="tag tag-cyan">Temperature</span>
              <span className="tag">High</span>
              <span className="tag">Low</span>
              <span className="tag">Status</span>
            </div>
          </>
        )}
        {error && (
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-red)', fontSize: 'var(--text-sm)' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
