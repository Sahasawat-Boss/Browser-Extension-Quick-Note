import { useEffect, useState, useRef } from 'react';

function App() {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ดึงข้อมูลเมื่อ Component Mount
  useEffect(() => {
    chrome.storage.local.get(['note'], (res: { note?: string }) => {
      setNote(res.note ?? '');
    });
    // ให้ Focus ที่ textarea ทันที
    textareaRef.current?.focus();
  }, []);

  const saveNote = () => {
    chrome.storage.local.set({ note }, () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1500);
    });
  };

  const clearNote = () => {
    if (confirm('Are you sure you want to clear the note?')) {
      chrome.storage.local.remove('note', () => {
        setNote('');
      });
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h3 style={styles.title}>📝 Quick Note</h3>
        <span style={{ fontSize: '10px', color: '#888' }}>v1.1</span>
      </header>

      <div style={styles.editorContainer}>
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="// Type your thoughts here..."
          style={styles.textarea}
          onKeyDown={(e) => {
            // Key shortcut: Ctrl+Enter or Cmd+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              saveNote();
            }
          }}
        />

        {/* Save Indicator Overlay */}
        {isSaving && <div style={styles.saveToast}>✔ Saved!</div>}
      </div>

      <div style={styles.footer}>
        <div style={styles.buttonGroup}>
          <button onClick={saveNote} style={{ ...styles.button, ...styles.saveBtn }}>
            Save
          </button>
          <button onClick={clearNote} style={{ ...styles.button, ...styles.clearBtn }}>
            Clear
          </button>
        </div>
        <div style={styles.shortcutHint}>
          Press <b>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter</b> to save
        </div>
      </div>
    </div>
  );
}

// --- สไตล์แบบจัดเต็ม ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '16px',
    width: '320px',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
  },
  editorContainer: {
    position: 'relative',
    width: '100%',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Fira Code", "Source Code Pro", monospace',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#f9f9f9',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  clearBtn: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  shortcutHint: {
    fontSize: '11px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  saveToast: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    animation: 'fadeInOut 1.5s ease-in-out',
  },
};

export default App;