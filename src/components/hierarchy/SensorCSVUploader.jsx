import { useCallback, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { uploadReadings } from '../../services/readings';

export default function SensorCSVUploader({ sensorId, onUploaded }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a .csv file');
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const result = await uploadReadings(sensorId, file);
        onUploaded(result);
      } catch (err) {
        setError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [sensorId, onUploaded]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      className={`drop-zone ${dragging ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <Loader2 size={40} color="var(--color-cyan)" style={{ animation: 'spin-slow 1s linear infinite' }} />
          </div>
          <div className="drop-zone-title">Uploading & parsing CSV...</div>
        </div>
      ) : (
        <>
          <div className="drop-zone-icon">📊</div>
          <div className="drop-zone-title">
            Drop CSV file here or <span style={{ color: 'var(--color-cyan)' }}>browse</span>
          </div>
          <div className="drop-zone-subtitle" style={{ marginTop: 8 }}>
            Needs a TimeStamp column and a value column · up to 50,000 rows
          </div>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="tag tag-cyan">TimeStamp</span>
            <span className="tag tag-cyan">Temperature / AirFlow / Value</span>
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
  );
}
