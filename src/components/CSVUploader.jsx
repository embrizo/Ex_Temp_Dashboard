import { useData } from '../context/DataContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';

export default function CSVUploader({ onUploaded }) {
  const { parseCSV, isLoading, error, parseProgress } = useData();
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
    // Clear the input so the same file can be uploaded again if needed
    if (inputRef.current) inputRef.current.value = '';
  }, [parseCSV, onUploaded]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

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
              Supports Temperature or Air Flow logs · up to 50,000 rows
            </div>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="tag tag-cyan">TimeStamp</span>
              <span className="tag tag-cyan">Temperature | AirFlow</span>
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
