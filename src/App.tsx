import { useEffect, useState, useRef } from 'react';
import { FiSave, FiTrash2, FiCopy, FiCheck, FiEdit3, FiExternalLink } from 'react-icons/fi';

function App() {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chrome.storage.local.get(['note'], (res: { note?: string }) => {
      setNote(res.note ?? '');
    });
    textareaRef.current?.focus();
  }, []);

  const handleSaveAndCopy = async () => {
    if (!note) return;
    chrome.storage.local.set({ note }, async () => {
      try {
        await navigator.clipboard.writeText(note);
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
        textareaRef.current?.select();
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
  };

  const clearNote = () => {
    if (note && confirm('Delete this note?')) {
      chrome.storage.local.remove('note', () => setNote(''));
    }
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            overflow: hidden;
          }
          .btn-hover {
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          }
          .btn-hover:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          .btn-hover:active {
            transform: scale(0.95);
          }
          .creator-link {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 3px;
          }
          .creator-link:hover {
            color: #4f46e5;
            text-decoration: underline;
          }
        `}
      </style>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={styles.logoIcon}><FiEdit3 size={18} color="white" /></div>
            <h3 style={styles.title}>Quick Note</h3>
          </div>
          <div style={styles.versionTag}>v1.0.9</div>
        </header>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div />
          <button
            onClick={handleSaveAndCopy}
            className="btn-hover"
            style={styles.inlineCopyBtn}
            disabled={!note}
          >
            <FiCopy size={13} />
            <span>Copy All</span>
          </button>
        </div>

        {/* Main Editor */}
        <div style={styles.editorContainer}>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="// Write or paste anything here..."
            style={{
              ...styles.textarea,
              borderColor: status === 'success' ? '#10b981' : '#e2e8f0'
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSaveAndCopy();
              }
            }}
          />

          {status === 'success' && (
            <div style={styles.successToast}>
              <FiCheck size={14} />
              <span>Saved & Copied!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.footer}>
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSaveAndCopy}
              className="btn-hover"
              style={{ ...styles.button, ...styles.saveBtn }}
            >
              <FiSave size={18} />
              <span>Save & Copy All</span>
            </button>

            <button
              onClick={clearNote}
              className="btn-hover"
              style={{ ...styles.button, ...styles.clearBtn }}
              disabled={!note}
            >
              <FiTrash2 size={18} />
            </button>
          </div>

          <div style={styles.shortcutHint}>
            Press <b>{isMac ? '⌘' : 'Ctrl'} + Enter</b> to Save and Copy everything.
          </div>

          {/* Attribution Link */}
          <div style={styles.attribution}>
            Developed by{' '}
            <a
              href="https://www.bossbsynth.com"
              target="_blank"
              rel="noreferrer"
              className="creator-link"
            >
              BSynth <FiExternalLink size={10} />
            </a>
          </div>

        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    width: '400px',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  logoIcon: {
    backgroundColor: '#4f46e5',
    padding: '6px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 800,
    color: '#1e293b',
  },
  versionTag: {
    fontSize: '10px',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#64748b',
    fontWeight: 600,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
  },
  inlineCopyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#f1f5f9',
    border: 'none',
    color: '#4f46e5',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  editorContainer: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '220px',
    padding: '18px',
    borderRadius: '18px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    lineHeight: '1.6',
    resize: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Fira Code", monospace',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#334155',
    transition: 'border-color 0.3s ease',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
  },
  saveBtn: {
    flex: 4,
    backgroundColor: '#4f46e5',
    color: 'white',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  shortcutHint: {
    fontSize: '11px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  attribution: {
    fontSize: '10px',
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: '4px',
  },
  successToast: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
  },
};

export default App;