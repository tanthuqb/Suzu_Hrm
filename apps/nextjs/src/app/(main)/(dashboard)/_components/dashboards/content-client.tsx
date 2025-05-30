"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Save, Upload, X } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Switch } from "@acme/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { Textarea } from "@acme/ui/textarea";

export default function ResoucePageClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    type: "", // guides, documents, resources
    category: "",
    content: "",
    attachments: [] as string[],
    isPublished: false,
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [newAttachment, setNewAttachment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/hrm/admin");
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addAttachment = () => {
    if (
      newAttachment.trim() &&
      !formData.attachments.includes(newAttachment.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment.trim()],
      }));
      setNewAttachment("");
    }
  };

  const removeAttachment = (attachmentToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att !== attachmentToRemove),
    }));
  };

  const typeOptions = [
    { value: "guides", label: "Hướng dẫn FAQ" },
    { value: "documents", label: "Tài liệu" },
    { value: "resources", label: "Tài nguyên" },
  ];

  const categoryOptions = [
    { value: "IT", label: "Hệ thống IT" },
    { value: "HR", label: "Nhân sự" },
    { value: "Policy", label: "Chính sách" },
    { value: "General", label: "Chung" },
    { value: "Forms", label: "Biểu mẫu" },
    { value: "Contact", label: "Liên hệ" },
    { value: "Tools", label: "Công cụ" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
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
              Tạo nội dung mới
            </h1>
            <p className="text-gray-600">
              Tạo hướng dẫn, tài liệu hoặc tài nguyên cho nhân viên
            </p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Nhập thông tin cơ bản cho nội dung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề/Câu hỏi *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="VD: Làm thế nào để thiết lập email công ty?"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="type">Loại nội dung *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại nội dung" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung chi tiết</CardTitle>
                <CardDescription>
                  {formData.type === "guides"
                    ? "Viết câu trả lời chi tiết cho câu hỏi"
                    : "Mô tả chi tiết về tài liệu/tài nguyên này"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="content">
                    {formData.type === "guides" ? "Câu trả lời" : "Mô tả"} *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    placeholder={
                      formData.type === "guides"
                        ? "Viết câu trả lời chi tiết, có thể sử dụng nhiều dòng..."
                        : "Mô tả chi tiết về tài liệu/tài nguyên này..."
                    }
                    className="mt-2 min-h-[200px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tệp đính kèm</CardTitle>
                <CardDescription>
                  Thêm tài liệu, hướng dẫn hoặc biểu mẫu liên quan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    placeholder="Tên tệp đính kèm (VD: email-setup-guide.pdf)"
                  />
                  <Button
                    type="button"
                    onClick={addAttachment}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tệp đã thêm:</Label>
                    {formData.attachments.map((attachment, index) => (
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

                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-gray-600">
                    Hoặc tải lên tệp từ máy tính
                  </p>
                  <Button type="button" variant="outline">
                    Chọn tệp
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags và từ khóa</CardTitle>
                <CardDescription>
                  Thêm tags để dễ dàng tìm kiếm và phân loại
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Thêm tag (VD: email, setup, IT)"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
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

            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPublished", checked)
                  }
                />
                <Label htmlFor="publish">Xuất bản ngay</Label>
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Lưu nháp
                </Button>
                <Button type="submit">
                  {formData.isPublished ? "Xuất bản" : "Lưu"}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Xem trước nội dung</CardTitle>
              <CardDescription>
                Xem nội dung như nhân viên sẽ thấy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="mb-2 text-xl font-bold">
                      {formData.title || "Tiêu đề nội dung"}
                    </h2>
                    <div className="mb-4 flex items-center space-x-2">
                      {formData.type && (
                        <Badge variant="outline">
                          {
                            typeOptions.find((t) => t.value === formData.type)
                              ?.label
                          }
                        </Badge>
                      )}
                      {formData.category && (
                        <Badge variant="secondary">
                          {
                            categoryOptions.find(
                              (c) => c.value === formData.category,
                            )?.label
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prose mb-6 max-w-none">
                  <p className="whitespace-pre-line">
                    {formData.content || "Nội dung sẽ hiển thị ở đây..."}
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Tài liệu đính kèm:
                    </h4>
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="flex-1 text-sm">{file}</span>
                          <Button size="sm" variant="ghost">
                            Tải xuống
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
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
                <Input type="date" className="w-auto" />
                <p className="mt-1 text-sm text-gray-500">
                  Để trống nếu không có ngày hết hạn
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
