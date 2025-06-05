"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { FullPostRecord } from "@acme/db";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { trpc } from "~/trpc/server";

interface Author {
  id: string;
  name: string;
  role: string;
}

interface PostsTableProps {
  initialPosts?: FullPostRecord[];
}

// Mock data
const mockAuthors: Author[] = [
  { id: "user-1", name: "Nguyễn Văn A", role: "Admin" },
  { id: "user-2", name: "Trần Thị B", role: "Editor" },
  { id: "user-3", name: "Lê Văn C", role: "Writer" },
  { id: "user-4", name: "Phạm Thị D", role: "Writer" },
];

const mockPosts: FullPostRecord[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Hướng dẫn sử dụng React và TypeScript",
    content: "<p>React là một thư viện JavaScript mạnh mẽ...</p>",
    status: "published",
    author: {
      id: "user-1",
      firstName: "Nguyễn Văn A",
      lastName: "Nguyễn",
      email: "sd@gmail.com",
    },
    authorId: "user-1",
    notes: [],
    tags: [],
    post_tags: [],
    attachments: ["react-guide.pdf"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Hướng dẫn sử dụng React và TypeScript",
    content: "<p>React là một thư viện JavaScript mạnh mẽ...</p>",
    status: "published",
    author: {
      id: "user-1",
      firstName: "Nguyễn Văn A",
      lastName: "Nguyễn",
      email: "sd@gmail.com",
    },
    authorId: "user-1",
    notes: [],
    tags: [],
    post_tags: [],
    attachments: ["react-guide.pdf"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
  },
];

const StatusBadge = ({ status }: { status: FullPostRecord["status"] }) => {
  const statusConfig = {
    published: { label: "Đã xuất bản", variant: "default" as const },
    draft: { label: "Bản nháp", variant: "default" as const },
    pending: { label: "Chờ duyệt", variant: "secondary" as const },
    approved: { label: "Đã duyệt", variant: "default" as const },
    rejected: { label: "Từ chối", variant: "destructive" as const },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "published" || status === "approved"
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : status === "pending"
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            : status === "rejected"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : ""
      }
    >
      {config.label}
    </Badge>
  );
};

export default function PostsTable({
  initialPosts = mockPosts,
}: PostsTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<FullPostRecord[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FullPostRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    FullPostRecord["status"] | "all"
  >("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FullPostRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft" as FullPostRecord["status"],
    authorId: "user-1",
    tags: [] as string[],
    attachments: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const postsWithAuthorNames = initialPosts.map((post) => {
      const author = mockAuthors.find((author) => author.id === post.authorId);
      return {
        ...post,
        authorName: author?.name || "Unknown",
      };
    });
    setPosts(postsWithAuthorNames);
    setFilteredPosts(postsWithAuthorNames);
  }, [initialPosts]);

  useEffect(() => {
    let result = [...posts];

    if (statusFilter !== "all") {
      result = result.filter((post) => post.status === statusFilter);
    }

    if (authorFilter !== "all") {
      result = result.filter((post) => post.authorId === authorFilter);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (post) => post.title.toLowerCase().includes(searchLower),
        //   post.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        //   post.authorName?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredPosts(result);
    setCurrentPage(1);
  }, [posts, statusFilter, authorFilter, searchTerm]);

  // const { data: postsData } = useSuspenseQuery({
  //   ...trpc.posts.getAllPosts.queryOptions({
  //     page: currentPage,
  //     pageSize: postsPerPage,
  //   }),
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnMount: false,
  //   refetchOnWindowFocus: false,
  // });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCreatePost = () => {
    setFormData({
      title: "",
      content: "",
      status: "draft",
      authorId: "user-1",
      tags: [],
      attachments: [],
    });
    setIsCreateDialogOpen(true);
  };

  // Handle edit post
  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        status: post.status,
        authorId: post.authorId!,
        tags: Array.isArray(post.tags) ? post.tags.map((tag) => tag.name) : [],
        attachments: post.attachments!,
      });
      setIsEditDialogOpen(true);
    }
  };

  // Handle view post
  const handleViewPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsViewDialogOpen(true);
    }
  };

  // Handle delete post
  const handleDeletePost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsDeleteDialogOpen(true);
    }
  };

  // Submit create form
  const handleSubmitCreate = async () => {
    if (!formData.title.trim()) {
      toast("Lỗi", {
        description: "Vui lòng nhập tiêu đề bài viết.",
      });
      return;
    }

    const newPost: FullPostRecord = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      status: formData.status,
      authorId: formData.authorId,
      post_tags: [],
      tags: [],
      notes: [],
      author: {
        id: formData.authorId,
        firstName:
          mockAuthors
            .find((a) => a.id === formData.authorId)
            ?.name.split(" ")[0] || "Unknown",
        lastName:
          mockAuthors
            .find((a) => a.id === formData.authorId)
            ?.name.split(" ")[1] || "Unknown",
        email: mockAuthors.find((a) => a.id === formData.authorId)?.name || "",
      },
      attachments: formData.attachments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPosts([newPost, ...posts]);
    setIsCreateDialogOpen(false);
    toast("Thành công", {
      description: "Bài viết đã được tạo thành công.",
    });
    setFormData({
      title: "",
      content: "",
      status: "draft",
      authorId: "user-1",
      tags: [],
      attachments: [],
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedPost || !formData.title.trim()) {
      toast("Lỗi", {
        description: "Vui lòng nhập tiêu đề bài viết.",
      });
      return;
    }

    const updatedPosts = {
      // posts.map((post) =>
      //   post.id === selectedPost.id
      //     ? {
      //         ...post,
      //         title: formData.title,
      //         content: formData.content,
      //         status: formData.status,
      //         authorId: formData.authorId,
      //         authorName:
      //           mockAuthors.find((a) => a.id === formData.authorId)?.name ||
      //           "Unknown",
      //         post_tags: [],
      //         notes: [],
      //         author: {
      //           id: formData.authorId,
      //           firstName:
      //             mockAuthors
      //               .find((a) => a.id === formData.authorId)
      //               ?.name.split(" ")[0] || "Unknown",
      //           lastName:
      //             mockAuthors
      //               .find((a) => a.id === formData.authorId)
      //               ?.name.split(" ")[1] || "Unknown",
      //           email:
      //             mockAuthors.find((a) => a.id === formData.authorId)?.name || "",
      //         },
      //         s
      //         tags: formData.tags,
      //         attachments: formData.attachments,
      //         updatedAt: new Date(),
      //       }
      //     : post,
      // );
      // setPosts(updatedPosts);
      // setIsEditDialogOpen(false);
      // setSelectedPost(null);
      // toast("Thành công", {
      //   description: "Bài viết đã được cập nhật thành công.",
      // });
    };
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedPost) return;

    const updatedPosts = posts.filter((post) => post.id !== selectedPost.id);
    setPosts(updatedPosts);
    setIsDeleteDialogOpen(false);
    setSelectedPost(null);
    toast("Thành công", {
      description: "Bài viết đã được xóa thành công.",
    });
  };

  // Add tag to form
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // Remove tag from form
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all");
    setAuthorFilter("all");
    setSearchTerm("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Quản lý bài viết</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={resetFilters}
              title="Xóa bộ lọc"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  Trạng thái
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    <span className={statusFilter === "all" ? "font-bold" : ""}>
                      Tất cả
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("published")}
                  >
                    <span
                      className={
                        statusFilter === "published" ? "font-bold" : ""
                      }
                    >
                      Đã xuất bản
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    <span
                      className={statusFilter === "draft" ? "font-bold" : ""}
                    >
                      Bản nháp
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    <span
                      className={statusFilter === "pending" ? "font-bold" : ""}
                    >
                      Chờ duyệt
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                    <span
                      className={statusFilter === "rejected" ? "font-bold" : ""}
                    >
                      Từ chối
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  Tác giả
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Lọc theo tác giả</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setAuthorFilter("all")}>
                    <span className={authorFilter === "all" ? "font-bold" : ""}>
                      Tất cả
                    </span>
                  </DropdownMenuItem>
                  {mockAuthors.map((author) => (
                    <DropdownMenuItem
                      key={author.id}
                      onClick={() => setAuthorFilter(author.id)}
                    >
                      <span
                        className={
                          authorFilter === author.id ? "font-bold" : ""
                        }
                      >
                        {author.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCreatePost}>Tạo mới</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tiêu đề</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    {/* <TableCell>{post.authorName}</TableCell> */}
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {/* {post.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 2}
                          </Badge>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* {post.updatedAt.toLocaleDateString("vi-VN")} */}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPost(post.id)}
                          title="Xem bài viết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPost(post.id)}
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePost(post.id)}
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không tìm thấy bài viết nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {indexOfFirstPost + 1}-
              {Math.min(indexOfLastPost, filteredPosts.length)} trong{" "}
              {filteredPosts.length} bài viết
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show current page, first page, last page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1 ||
                      (page === 2 && currentPage === 1) ||
                      (page === totalPages - 1 && currentPage === totalPages)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter =
                      index < array.length - 1 && array[index + 1] !== page + 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => paginate(page)}
                          className="h-8 w-8"
                        >
                          {page}
                        </Button>
                        {showEllipsisAfter && <span className="px-2">...</span>}
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo bài viết mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo bài viết mới.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>
            <div>
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Nhập nội dung bài viết..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: FullPostRecord["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="author">Tác giả</Label>
                <Select
                  value={formData.authorId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, authorId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tác giả" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mb-2 flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
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
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitCreate}>Tạo bài viết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
            <DialogDescription>Cập nhật thông tin bài viết.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Tiêu đề</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Nội dung</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Nhập nội dung bài viết..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: FullPostRecord["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-author">Tác giả</Label>
                <Select
                  value={formData.authorId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, authorId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tác giả" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mb-2 flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
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
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitEdit}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Tiêu đề
                </Label>
                <p className="text-lg font-semibold">{selectedPost.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Nội dung
                </Label>
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{
                    __html: selectedPost.content || "<p>Không có nội dung</p>",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedPost.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Tác giả
                  </Label>
                  {/* <p className="text-sm">{selectedPost.authorName}</p> */}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Tags
                </Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {/* {selectedPost.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))} */}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Ngày tạo
                  </Label>
                  <p className="text-sm">
                    {selectedPost.createdAt?.toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Ngày cập nhật
                  </Label>
                  <p className="text-sm">
                    {selectedPost.updatedAt?.toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              {/* {selectedPost?.attachments?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Tệp đính kèm
                  </Label>
                  <div className="mt-1 space-y-2">
                    {selectedPost.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{selectedPost?.title}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
