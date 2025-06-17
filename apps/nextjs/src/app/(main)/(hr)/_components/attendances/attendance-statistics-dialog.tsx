"use client";

import { useState } from "react";
import { BarChart3, Calendar, Clock, TrendingUp } from "lucide-react";

import { AttendanceStatus } from "@acme/db";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

import type { AttendanceStatusCount } from "~/libs/data/attendances";

const statusConfig = {
  [AttendanceStatus.WorkDay]: {
    label: "Ngày công có lương",
    description: "Ngày làm việc bình thường tại văn phòng",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    icon: "💼",
    category: "work",
  },
  [AttendanceStatus.PaidLeaveFull]: {
    label: "Nghỉ phép cả ngày có lương",
    description: "Nghỉ phép toàn bộ ngày làm việc",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: "🏖️",
    category: "leave",
  },
  [AttendanceStatus.PaidLeaveHalfWork]: {
    label: "Nghỉ phép nửa ngày có lương",
    description: "Nửa ngày làm việc, nửa ngày nghỉ",
    color: "bg-cyan-500",
    textColor: "text-cyan-700",
    bgColor: "bg-cyan-50",
    icon: "⏰",
    category: "leave",
  },
  [AttendanceStatus.UnpaidLeave]: {
    label: "Nghỉ không lương",
    description: "Ngày nghỉ phép không được trả lương",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    icon: "❌",
    category: "leave",
  },
  [AttendanceStatus.PaidHoliday]: {
    label: "Nghỉ lễ có lương",
    description: "Nghỉ lễ tết theo quy định",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: "🎉",
    category: "holiday",
  },
  [AttendanceStatus.CompensateFull]: {
    label: "Nghỉ bù có lương",
    description: "Nghỉ bù do làm thêm ngoài giờ",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: "🔄",
    category: "compensate",
  },
  [AttendanceStatus.WorkFromHome]: {
    label: "Làm việc tại nhà",
    description: "Ngày làm việc từ xa",
    color: "bg-indigo-500",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    icon: "🏠",
    category: "work",
  },
};
interface AttendanceStatsDialogProps {
  attendanceData: AttendanceStatusCount[];
  userName?: string;
  period?: string;
  totalWorkingDays?: number;
  trigger?: React.ReactNode;
}

export function AttendanceStatsDialog({
  attendanceData,
  userName,
  period = "Tháng này",
  totalWorkingDays,
}: AttendanceStatsDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const counts = attendanceData[0]?.counts ?? {};

  const flatData = Object.entries(counts).map(([status, count]) => ({
    status: status as AttendanceStatus,
    count: typeof count === "number" ? count : 0,
    percentage:
      totalWorkingDays! > 0 && typeof count === "number"
        ? (count / totalWorkingDays!) * 100
        : 0,
  }));

  const categories = {
    work: flatData.filter(
      (item) => statusConfig[item.status].category === "work",
    ),
    leave: flatData.filter(
      (item) => statusConfig[item.status].category === "leave",
    ),
    holiday: flatData.filter(
      (item) => statusConfig[item.status].category === "holiday",
    ),
    compensate: flatData.filter(
      (item) => statusConfig[item.status].category === "compensate",
    ),
  };

  const filteredData =
    selectedCategory === "all"
      ? flatData
      : (categories[selectedCategory as keyof typeof categories] ?? []);

  const workDays = categories.work.reduce((sum, i) => sum + i.count, 0);
  const leaveDays = categories.leave.reduce((sum, i) => sum + i.count, 0);
  const totalDays = flatData.reduce((sum, i) => sum + i.count, 0);
  const attendanceRate =
    totalWorkingDays! > 0 ? (workDays / totalWorkingDays!) * 100 : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Thống kê chấm công
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thống kê chấm công chi tiết
          </DialogTitle>
          <DialogDescription>
            Báo cáo chấm công của {userName} - {period}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng ngày</p>
                    <p className="text-2xl font-bold">{totalDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ngày làm việc
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {workDays}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày nghỉ</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {leaveDays}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tỷ lệ đi làm
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={selectedCategory === "work" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("work")}
            >
              Làm việc (
              {categories.work.reduce((sum, item) => sum + item.count, 0)})
            </Button>
            <Button
              variant={selectedCategory === "leave" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("leave")}
            >
              Nghỉ phép (
              {categories.leave.reduce((sum, item) => sum + item.count, 0)})
            </Button>
            <Button
              variant={selectedCategory === "holiday" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("holiday")}
            >
              Nghỉ lễ (
              {categories.holiday.reduce((sum, item) => sum + item.count, 0)})
            </Button>
            <Button
              variant={
                selectedCategory === "compensate" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedCategory("compensate")}
            >
              Nghỉ bù (
              {categories.compensate.reduce((sum, item) => sum + item.count, 0)}
              )
            </Button>
          </div>

          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết theo loại</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map((item) => {
                  const config = statusConfig[item.status];
                  if (!config) return null;

                  return (
                    <div
                      key={item.status}
                      className={`rounded-lg p-4 ${config.bgColor} border`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <h4 className={`font-semibold ${config.textColor}`}>
                              {config.label}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-lg font-bold"
                            >
                              {item.count}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tỷ lệ</span>
                          <span className="font-medium">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredData.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Không có dữ liệu cho danh mục này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
