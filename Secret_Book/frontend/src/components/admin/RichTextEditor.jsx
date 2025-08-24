import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter
} from 'lucide-react';

const RichTextEditor = ({ content, onChange, placeholder = "Nhập mô tả..." }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { getToken } = useAuth();
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageResize.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
          style: 'max-width: 100%; max-height: 300px; object-fit: contain;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] max-h-[600px] overflow-y-auto p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-em:text-gray-900 dark:prose-em:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-900 dark:prose-li:text-gray-100',
      },
    }
  });

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          const token = getToken();
          if (!token) {
            alert('Bạn cần đăng nhập để tải ảnh lên');
            return;
          }

          const formData = new FormData();
          formData.append('image', file);

          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          };

          const response = await api.post('/upload/editor-image', formData, config);
          
          if (response.data.success) {
            const imageUrl = response.data.data.url;
            editor.chain().focus().setImage({ src: imageUrl }).run();
          } else {
            alert('Lỗi khi tải ảnh lên: ' + response.data.error);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Có lỗi xảy ra khi tải ảnh lên: ' + (error.response?.data?.error || error.message));
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  }, [editor, getToken]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const setColor = useCallback((color) => {
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const setHighlight = useCallback((color) => {
    editor.chain().focus().setHighlight({ color }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('code') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Code"
            >
              <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('blockquote') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <div className="relative group">
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Text Color"
              >
                <Palette className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-2 z-10">
                <div className="grid grid-cols-6 gap-1">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Highlight"
              >
                <Highlighter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-2 z-10">
                <div className="grid grid-cols-6 gap-1">
                  {['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FFC0CB'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setHighlight(color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              type="button"
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('link') ? 'bg-gray-300 dark:bg-gray-600' : ''
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={addImage}
              disabled={isUploading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isUploading ? "Đang tải ảnh..." : "Add Image"}
            >
              <ImageIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};

export default RichTextEditor;