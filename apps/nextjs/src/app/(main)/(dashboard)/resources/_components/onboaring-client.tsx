"use client";

import { useState } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

// Mock data cho FAQ và tài liệu
const faqData = {
  guides: [
    {
      id: 1,
      question: "Làm thế nào để thiết lập tài khoản email công ty?",
      answer:
        "Để thiết lập email công ty, bạn cần làm theo các bước sau:\n1. Truy cập vào portal IT tại it.company.com\n2. Đăng nhập bằng thông tin được cung cấp\n3. Chọn 'Email Setup' và làm theo hướng dẫn\n4. Liên hệ IT Support nếu gặp vấn đề",
      category: "IT",
      attachments: ["email-setup-guide.pdf"],
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      question: "Quy trình xin nghỉ phép như thế nào?",
      answer:
        "Quy trình xin nghỉ phép:\n1. Đăng nhập vào hệ thống HR\n2. Chọn 'Leave Request'\n3. Điền thông tin ngày nghỉ và lý do\n4. Gửi yêu cầu cho manager phê duyệt\n5. Nhận thông báo kết quả qua email",
      category: "HR",
      attachments: ["leave-policy.pdf"],
      lastUpdated: "2024-01-10",
    },
    {
      id: 3,
      question: "Chính sách làm việc từ xa của công ty?",
      answer:
        "Công ty cho phép làm việc từ xa với các điều kiện:\n1. Tối đa 2 ngày/tuần\n2. Phải có sự đồng ý của manager\n3. Đảm bảo kết nối internet ổn định\n4. Tham gia đầy đủ các cuộc họp online\n5. Báo cáo tiến độ công việc hàng ngày",
      category: "Policy",
      attachments: ["remote-work-policy.pdf"],
      lastUpdated: "2024-01-20",
    },
  ],
  documents: [
    {
      id: 4,
      question: "Sổ tay nhân viên",
      answer:
        "Sổ tay nhân viên chứa tất cả thông tin quan trọng về công ty, quy định, chính sách và quyền lợi của nhân viên.",
      category: "General",
      attachments: ["employee-handbook.pdf", "company-policies.pdf"],
      lastUpdated: "2024-01-01",
    },
    {
      id: 5,
      question: "Biểu mẫu và đơn từ",
      answer:
        "Tập hợp các biểu mẫu thường dùng trong công ty bao gồm đơn xin nghỉ, đơn tạm ứng, đơn đề xuất, v.v.",
      category: "Forms",
      attachments: [
        "leave-form.docx",
        "advance-request-form.docx",
        "proposal-form.docx",
      ],
      lastUpdated: "2024-01-05",
    },
  ],
  resources: [
    {
      id: 6,
      question: "Danh bạ nội bộ",
      answer: "Thông tin liên hệ của các phòng ban và nhân viên trong công ty.",
      category: "Contact",
      attachments: ["internal-directory.pdf"],
      lastUpdated: "2024-01-18",
    },
    {
      id: 7,
      question: "Hệ thống và công cụ làm việc",
      answer:
        "Hướng dẫn sử dụng các hệ thống và công cụ làm việc: CRM, Project Management, Communication tools.",
      category: "Tools",
      attachments: ["crm-guide.pdf", "project-tool-guide.pdf"],
      lastUpdated: "2024-01-12",
    },
  ],
};

const categories = [
  { id: "all", name: "Tất cả", icon: BookOpen },
  { id: "IT", name: "Hệ thống IT", icon: Settings },
  { id: "HR", name: "Nhân sự", icon: Users },
  { id: "Policy", name: "Chính sách", icon: FileText },
  { id: "General", name: "Chung", icon: BookOpen },
  { id: "Forms", name: "Biểu mẫu", icon: FileText },
  { id: "Contact", name: "Liên hệ", icon: Users },
  { id: "Tools", name: "Công cụ", icon: Settings },
];

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("guides");

  const allItems = [
    ...faqData.guides,
    ...faqData.documents,
    ...faqData.resources,
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTabItems = (tab: string) => {
    switch (tab) {
      case "guides":
        return faqData.guides;
      case "documents":
        return faqData.documents;
      case "resources":
        return faqData.resources;
      default:
        return [];
    }
  };

  return (
    <div className="h-full w-full">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Tài nguyên cho nhân viên mới
        </h1>
        <p className="mb-6 text-gray-600">
          Tìm hiểu về công ty, quy trình làm việc và các tài nguyên hỗ trợ
        </p>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Tìm kiếm hướng dẫn, tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => window.open("/hrm/user/question", "_blank")}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Đặt câu hỏi</span>
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guides" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Hướng dẫn FAQ</span>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Tài liệu</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Tài nguyên</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi thường gặp</CardTitle>
              <CardDescription>
                Các hướng dẫn và giải đáp cho những câu hỏi phổ biến của nhân
                viên mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-4">
                {(searchTerm || selectedCategory !== "all"
                  ? filteredItems
                  : faqData.guides
                ).map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={`item-${item.id}`}
                    className="rounded-lg border px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex w-full items-start justify-between pr-4">
                        <span className="font-medium">{item.question}</span>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {item.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-line text-gray-700">
                            {item.answer}
                          </p>
                        </div>

                        {item.attachments && item.attachments.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-900">
                              Tài liệu đính kèm:
                            </h4>
                            <div className="space-y-2">
                              {item.attachments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2"
                                >
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="flex-1 text-sm">{file}</span>
                                  <Button size="sm" variant="ghost">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-2 text-xs text-gray-500">
                          Cập nhật lần cuối: {item.lastUpdated}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu công ty</CardTitle>
              <CardDescription>
                Các tài liệu chính thức, sổ tay và biểu mẫu của công ty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {(searchTerm || selectedCategory !== "all"
                  ? filteredItems
                  : faqData.documents
                ).map((item) => (
                  <Card
                    key={item.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {item.question}
                        </CardTitle>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <CardDescription>{item.answer}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {item.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium">
                                {file}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 text-xs text-gray-500">
                          Cập nhật: {item.lastUpdated}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Tài nguyên hỗ trợ</CardTitle>
              <CardDescription>
                Các công cụ, hệ thống và tài nguyên hỗ trợ công việc hàng ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {(searchTerm || selectedCategory !== "all"
                  ? filteredItems
                  : faqData.resources
                ).map((item) => (
                  <Card
                    key={item.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {item.question}
                        </CardTitle>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <CardDescription>{item.answer}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {item.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-blue-50 p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <Settings className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium">
                                {file}
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              Xem hướng dẫn
                            </Button>
                          </div>
                        ))}
                        <div className="pt-2 text-xs text-gray-500">
                          Cập nhật: {item.lastUpdated}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
