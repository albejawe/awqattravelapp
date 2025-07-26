import { useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, height = "400px" }: RichTextEditorProps) => {
  const quillRef = useRef<any>(null);
  const ReactQuill = useRef<any>(null);

  useEffect(() => {
    const loadQuill = async () => {
      if (typeof window !== 'undefined') {
        const { default: QuillComponent } = await import('react-quill');
        ReactQuill.current = QuillComponent;
        
        // Force re-render after loading
        if (quillRef.current) {
          quillRef.current.forceUpdate?.();
        }
      }
    };
    
    loadQuill();
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  if (!ReactQuill.current) {
    return (
      <div 
        className="w-full border border-input bg-background rounded-md p-4"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div>جاري تحميل المحرر...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <style>{`
        .ql-editor {
          min-height: ${height};
          font-family: inherit;
          direction: rtl;
          text-align: right;
        }
        
        .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: none;
          background: hsl(var(--background));
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          background: hsl(var(--background));
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          right: 15px;
          left: auto;
        }
        
        .ql-snow .ql-picker-label:hover,
        .ql-snow .ql-picker-item:hover {
          color: hsl(var(--primary));
        }
        
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover {
          color: hsl(var(--primary));
        }
        
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        
        .ql-editor h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 1rem 0;
          color: hsl(var(--foreground));
        }
        
        .ql-editor h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin: 0.875rem 0;
          color: hsl(var(--foreground));
        }
        
        .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }
        
        .ql-editor h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
          color: hsl(var(--foreground));
        }
        
        .ql-editor p {
          margin: 1rem 0;
          line-height: 1.7;
        }
        
        .ql-editor strong {
          font-weight: 600;
        }
        
        .ql-editor blockquote {
          border-right: 4px solid hsl(var(--border));
          border-left: none;
          padding-right: 1rem;
          padding-left: 0;
          margin: 1.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        
        .ql-editor .ql-video {
          width: 100%;
          height: 315px;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>
      
      <ReactQuill.current
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "ابدأ في كتابة مقالك هنا..."}
      />
    </div>
  );
};

export default RichTextEditor;