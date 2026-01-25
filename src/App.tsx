import { useEffect, useState, useRef } from 'react';
// Import ไอคอนจาก react-icons (ใช้ชุด Feather Icons 'fi' เพราะดู Modern)
import { FiSave, FiTrash2, FiCopy, FiCheck, FiEdit3 } from 'react-icons/fi';

function App() {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // State สำหรับปุ่ม Copy
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chrome.storage.local.get(['note'], (res: { note?: string }) => {
      setNote(res.note ?? '');
    });
    textareaRef.current?.focus();
  }, []);

  const saveNote = () => {
    chrome.storage.local.set({ note }, () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1500);
    });
  };

  const clearNote = () => {
    if (note && confirm('Are you sure you want to delete this note entirely?')) {
      chrome.storage.local.remove('note', () => {
        setNote('');
      });
    }
  };

  // ฟังก์ชันสำหรับ Copy ข้อความ
  const handleCopy = async () => {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(note);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div style={styles.container}>
      {/* Header Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiEdit3 size={18} color="#4f46e5" />
          <h3 style={styles.title}>Quick Note</h3>
        </div>
      </header>

      {/* New Toolbar area above textarea */}
      <div style={styles.toolbar}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Editor</span>
        <button
          onClick={handleCopy}
          style={styles.copyButton}
          disabled={!note}
          title="Copy to clipboard"
        >
          {isCopied ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
          <span style={{ marginLeft: 4 }}>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Editor Area */}
      <div style={styles.editorContainer}>
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="// Type something amazing..."
          style={styles.textarea}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              saveNote();
            }
          }}
        />

        {isSaving && <div style={styles.saveToast}><FiCheck size={14} /> Saved</div>}
      </div>

      {/* Footer Buttons */}
      <div style={styles.footer}>
        <div style={styles.buttonGroup}>
          <button onClick={saveNote} style={{ ...styles.button, ...styles.saveBtn }}>
            <FiSave size={16} />
            <span>Save Note</span>
          </button>
          <button
            onClick={clearNote}
            style={{ ...styles.button, ...styles.clearBtn }}
            disabled={!note}
          >
            <FiTrash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
        <div style={styles.shortcutHint}>
          Pro tip: Press <b>{isMac ? '⌘' : 'Ctrl'} + Enter</b> to save quickly.
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    // ปรับขนาดให้ใหญ่ขึ้นตามที่ขอ
    padding: '20px',
    width: '380px', // กว้างขึ้นจากเดิม 320px
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    // เอา border radius และ shadow ออกเพื่อให้ดูเป็น Native Popup ของ Chrome มากขึ้น (Optional)
    // borderRadius: '12px',
    // boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  },
  header: {
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.5px'
  },
  // Toolbar ใหม่ด้านบน textarea
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '-8px', // ดึง textarea ขึ้นมาให้ชิด
    padding: '0 4px'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#64748b',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  editorContainer: {
    position: 'relative',
    width: '100%',
  },
  textarea: {
    width: '100%',
    minHeight: '180px', // สูงขึ้นนิดหน่อย
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'none',
    boxSizing: 'border-box',
    // ใช้ Font Monospace ที่ดูดีขึ้น
    fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#f8fafc',
    color: '#334155'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    // จัดเรียงไอคอนกับข้อความให้อยู่ตรงกลาง
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
  },
  saveBtn: {
    backgroundColor: '#4f46e5', // สี Indigo สวยๆ
    color: 'white',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
  },
  clearBtn: {
    // สีแดงตามที่ขอ (Soft Red)
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    // เพิ่ม hover effect ใน inline style อาจจะยากหน่อย ถ้าใช้ CSS class จะง่ายกว่า
    // แต่สีนี้ก็สื่อถึงความอันตรายได้ดี
  },
  shortcutHint: {
    fontSize: '11px',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '4px'
  },
  saveToast: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.9)', // Green with transparency
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    pointerEvents: 'none', // ไม่ให้บังการคลิก textarea
  },
};

export default App;