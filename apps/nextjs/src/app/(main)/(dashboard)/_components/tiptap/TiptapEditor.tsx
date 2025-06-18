"use client";

import { EditorContent } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";

import { useTiptapEditor } from "~/hooks/useTiptapEditor";

interface TiptapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
}

export function TiptapEditor({
  initialContent,
  placeholder,
  onChange,
}: TiptapEditorProps) {
  const { editor, getContent } = useTiptapEditor({
    initialContent,
    placeholder,
  });

  if (editor && onChange) {
    editor.on("update", () => onChange(getContent()));
  }

  return (
    <div>
      <Label htmlFor="content" className="mb-2 block">
        Nội dung
      </Label>

      {/* Thanh menu cơ bản */}
      {editor && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-md border px-2 py-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="min-h-[200px] rounded-md border p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
