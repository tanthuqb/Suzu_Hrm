"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";

import { createServerClient } from "@acme/supabase";

import type { InputLeaveRequest } from "~/app/types/index";
import { renderWFHEmail } from "~/app/_components/EmailTemplates/work-form-home.render";
import { env } from "~/env";

if (!env.RESEND_API_KEY) {
  throw new Error("Resend api not correct");
}
const resend = new Resend(env.RESEND_API_KEY);

export const sendLeaveRequest = async (
  leaveRequestsInput: InputLeaveRequest,
): Promise<{ data: any[] | null; error: PostgrestError | null }> => {
  const supabase = await createServerClient();
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
  if (!data) {
    throw new Error("No data returned from Supabase");
  }

  const htmlContent = await renderWFHEmail({
    name: leaveRequestsInput.name,
    department: leaveRequestsInput.department,
    reason: leaveRequestsInput.reason,
  });

  //const AuthUser = await checkAuth();

  await resend.emails.send({
    from: "HR System <delivered@resend.dev>",
    to: env.EMAIL_TO!,
    subject: `Đơn xin làm việc tại nhà - ${leaveRequestsInput.name}`,
    html: htmlContent,
  });
  return { data, error };
};
