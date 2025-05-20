"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";

import { createServerClient } from "@acme/supabase";

import type { InputLeaveRequest } from "~/types/index";
import { renderWFHEmail } from "~/components/EmailTemplates/work-form-home.render";
import { env } from "~/env";

if (!env.RESEND_API_KEY) {
  throw new Error("Resend api not correct");
}
const resend = new Resend(env.RESEND_API_KEY);

export const sendLeaveRequest = async (
  leaveRequestsInput: InputLeaveRequest,
): Promise<{ data: any[] | null; error: PostgrestError | null }> => {
  const supabase = await createServerClient();
  console.log(
    "🚀 ~ file: eForm.ts:20 ~ sendLeaveRequest ~ leaveRequestsInput:",
    leaveRequestsInput,
  );
  const { error, data } = await supabase.from("leave_requests").insert({
    name: leaveRequestsInput.name,
    user_id: leaveRequestsInput.userId,
    department: leaveRequestsInput.department,
    reason: leaveRequestsInput.reason,
    start_date: leaveRequestsInput.startDate,
    end_date: leaveRequestsInput.endDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  const htmlContent = await renderWFHEmail({
    name: leaveRequestsInput.name,
    department: leaveRequestsInput.department,
    reason: leaveRequestsInput.reason,
    link: `${env.NEXT_PUBLIC_APP_URL}/dashboard/leave-requests`,
  });

  await resend.emails.send({
    from: "HR System <delivered@resend.dev>",
    to: env.EMAIL_TO!,
    subject: `Đơn xin làm việc tại nhà - ${leaveRequestsInput.name}`,
    html: htmlContent,
  });
  return { data, error };
};
