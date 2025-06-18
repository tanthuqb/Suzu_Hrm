"use client";

import { useCallback, useState } from "react";
// TipTap Extensions
import CodeBlock from "@tiptap/extension-code-block";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface UseTiptapEditorProps {
  initialContent?: string;
  placeholder?: string;
}

export const useTiptapEditor = ({
  initialContent = "",
  placeholder = "Nhập nội dung...",
}: UseTiptapEditorProps) => {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    content: initialContent,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        strike: false, // fix duplicate
      }),
      Strike, // dùng riêng
      CodeBlock,
      Color,
      Highlight,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Typography,
      Underline,
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap ProseMirror prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[200px] max-w-none",
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
  });

  const updateContent = useCallback(
    (html: string) => {
      setContent(html);
      editor?.commands.setContent(html, false);
    },
    [editor],
  );

  return {
    editor,
    EditorContent,
    content,
    setContent: updateContent,
    getContent: () => editor?.getHTML() ?? "",
  };
};
