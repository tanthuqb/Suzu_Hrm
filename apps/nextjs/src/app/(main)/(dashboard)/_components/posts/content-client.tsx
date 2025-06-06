"use client";

import { useCallback, useEffect, useState } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bold,
  FileText,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";
import { Label } from "recharts";

import { postStatus } from "@acme/db";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Switch } from "@acme/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { toast } from "@acme/ui/toast";
import { isUUID } from "@acme/validators";

import { useTiptapEditor } from "~/hooks/useTiptapEditor";
import { useTRPC } from "~/trpc/react";

interface FileWithPreview {
  file: File;
  previewUrl?: string;
}

interface PostClientPageProps {
  userId: string;
  postId?: string;
}

export default function PostClientPage({
  userId,
  postId,
}: PostClientPageProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const isValidId = !!postId && isUUID(postId);
  const { data: post, isLoading } = useQuery({
    ...trpc.posts.getPostById.queryOptions({ id: postId ?? "" }),
    enabled: !!isValidId,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { editor, EditorContent, content, setContent } = useTiptapEditor({
    initialContent: post?.posts.content || "",
    placeholder: "Viết nội dung bài viết của bạn ở đây...",
  });

  useEffect(() => {
    return () => {
      console.log("Cleaning up file previews", files);
      files.forEach((fileObj) => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, [files]);

  useEffect(() => {
    if (post?.posts && editor) {
      setTitle(post.posts.title ?? "");
      if (Array.isArray(post.tags)) {
        setTags(post.tags.map((tag) => tag.name));
      } else if (post.tags?.name) {
        setTags([post.tags.name]);
      } else {
        setTags([]);
      }
      setAttachments(post.posts.attachments ?? []);
    }
  }, [post, editor]);

  const createPostMuatation = useMutation(
    trpc.posts.createPost.mutationOptions({
      onSuccess: () => {
        toast("Bài viết đã được tạo thành công!", {
          description: "Bạn có thể xem bài viết trong danh sách bài viết.",
        });
        router.push("/posts");
      },
      onError: (error) => {
        toast.error("Không thể tạo bài viết. Vui lòng thử lại sau.");
      },
    }),
  );

  const updatePostMutation = useMutation(
    trpc.posts.updatePost.mutationOptions({
      onSuccess: () => {
        toast("Bài viết đã được cập nhật thành công!", {
          description: "Bạn có thể xem bài viết trong danh sách bài viết.",
        });
        router.push("/posts");
      },
      onError: (error) => {
        toast.error("Không thể cập nhật bài viết. Vui lòng thử lại sau.");
      },
    }),
  );

  const deletePostMutation = useMutation(
    trpc.posts.deletePost.mutationOptions({
      onSuccess: () => {
        toast("Bài viết đã được xóa thành công!", {
          description: "Bạn có thể xem danh sách bài viết để xác nhận.",
        });
        router.push("/posts");
      },
      onError: (error) => {
        console.error("Lỗi khi xóa bài viết:", error);
        toast.error("Không thể xóa bài viết. Vui lòng thử lại sau.");
      },
    }),
  );

  const handleSaveDraft = () => {
    const payload = {
      title,
      content: editor?.getHTML() ?? "",
      status: postStatus.DRAFT as "draft",
      authorId: userId,
      tags,
      attachments,
    };
    if (isValidId) {
      updatePostMutation.mutate({
        id: postId,
        ...payload,
      });
    } else {
      createPostMuatation.mutate({
        ...payload,
      });
    }
    toast("Bài viết đã được lưu dưới dạng nháp!", {
      description: "Bạn có thể tiếp tục chỉnh sửa hoặc xuất bản sau.",
    });
  };

  const handlePublish = () => {
    const payload = {
      title,
      content: editor?.getHTML() ?? "",
      status: postStatus.PENDING as "pending",
      authorId: userId,
      tags,
      attachments,
    };

    if (isValidId) {
      updatePostMutation.mutate({
        id: postId,
        ...payload,
      });
    } else {
      createPostMuatation.mutate({
        ...payload,
      });
    }
    toast("Bài viết đã được gửi để xem xét!", {
      description: "Bài viết sẽ được xuất bản sau khi được phê duyệt.",
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addAttachment = () => {
    if (newAttachment.trim() && !attachments.includes(newAttachment.trim())) {
      setAttachments([...attachments, newAttachment.trim()]);
      setNewAttachment("");
    }
  };

  const removeAttachment = (attachmentToRemove: string) => {
    setAttachments(attachments.filter((att) => att !== attachmentToRemove));
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFilesArray = Array.from(selectedFiles).map((file) => {
        const fileWithPreview: FileWithPreview = {
          file: file,
        };

        if (isImageFile(file)) {
          fileWithPreview.previewUrl = URL.createObjectURL(file);
        }

        return fileWithPreview;
      });

      setFiles((prevFiles) => [...prevFiles, ...newFilesArray]);

      const newAttachmentNames = newFilesArray.map(
        (fileObj) => fileObj.file.name,
      );
      setAttachments((prev) => [...prev, ...newAttachmentNames]);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];

    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }

    setFiles(files.filter((_, i) => i !== index));
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const addImage = useCallback(() => {
    const url = window.prompt("URL hình ảnh");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("URL đường dẫn");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (postId && !isValidId) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-red-600">
          ID bài viết không hợp lệ
        </h2>
        <p className="mb-6 text-gray-600">
          ID "{postId}" không đúng định dạng UUID. Vui lòng kiểm tra lại URL.
        </p>
        <Button onClick={() => router.push("/posts")}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p>Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (postId && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p>Đang tải dữ liệu bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="mb-4 flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {postId ? "Cập nhật bài viết" : "Tạo bài viết mới"}
            </h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="edit">Soạn thảo</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card className="mb-4">
            <CardContent className="pt-6">
              <Input
                className="mb-4 border-0 border-b px-0 text-2xl font-bold focus-visible:ring-0"
                placeholder="Tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Rich Text Editor */}
              <div className="editor-container">
                <div className="mb-4 flex flex-wrap gap-2 rounded-md border bg-muted/40 p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "is-active" : ""}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "is-active" : ""}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={
                      editor.isActive("heading", { level: 1 })
                        ? "is-active"
                        : ""
                    }
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={
                      editor.isActive("heading", { level: 2 })
                        ? "is-active"
                        : ""
                    }
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className={editor.isActive("bulletList") ? "is-active" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className={
                      editor.isActive("orderedList") ? "is-active" : ""
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={addImage}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addLink}
                    className={editor.isActive("link") ? "is-active" : ""}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="min-h-[300px] rounded-md border p-4">
                  {editor && <EditorContent editor={editor} />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag (VD: tin-tức, công-nghệ)"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Tệp đính kèm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="Tên tệp đính kèm"
                />
                <Button type="button" onClick={addAttachment} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Array.isArray(attachments) && attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="file-upload" className="w-full">
                    <div className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 hover:bg-gray-50">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span>Chọn tệp từ máy tính</span>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>

                <div className="text-xs text-gray-500">
                  Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-md border bg-gray-50 p-3">
                    <div className="text-sm font-medium">
                      Files đã chọn ({files.length}):
                    </div>
                    {files.map((fileObj, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-white p-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {fileObj.previewUrl ? (
                            <div className="h-12 w-12 overflow-hidden rounded border bg-gray-100">
                              <NextImage
                                src={fileObj.previewUrl}
                                alt={fileObj.file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <FileText className="h-10 w-10 text-blue-600" />
                          )}
                          <div>
                            <div>{fileObj.file.name}</div>
                            <div className="text-xs text-gray-500">
                              ({(fileObj.file.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Lưu nháp
            </Button>
            <Button type="button" onClick={handlePublish}>
              {postId ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Xuất bản
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Xem trước bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h1>{title || "Tiêu đề bài viết"}</h1>

                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      editor.getHTML() ||
                      "<p>Nội dung sẽ hiển thị ở đây...</p>",
                  }}
                />

                {attachments.length > 0 && (
                  <div className="my-6 rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-lg font-medium">
                      Tài liệu đính kèm
                    </h3>
                    <ul className="space-y-2">
                      {attachments.map((file, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Xem trước có thể khác với hiển thị thực tế.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt nâng cao</CardTitle>
              <CardDescription>
                Cấu hình các tùy chọn nâng cao cho nội dung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Hiển thị trong tìm kiếm</Label>
                  <p className="text-sm text-gray-500">
                    Nội dung này có thể được tìm thấy qua tìm kiếm
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Gửi thông báo</Label>
                  <p className="text-sm text-gray-500">
                    Gửi email thông báo khi có nội dung mới
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Cho phép bình luận</Label>
                  <p className="text-sm text-gray-500">
                    Nhân viên có thể để lại bình luận
                  </p>
                </div>
                <Switch />
              </div>

              <div>
                <Label className="mb-2 block text-base">Ngày hết hạn</Label>
                <p className="mt-1 text-sm text-gray-500">
                  Để trống nếu không có ngày hết hạn
                </p>
                <Input type="date" className="w-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
