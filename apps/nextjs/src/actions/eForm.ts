"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";

import type { CreateLeaveRequestsInput } from "@acme/db/schema";
import { createServerClient } from "@acme/supabase";

import { renderWFHEmail } from "~/components/EmailTemplates/work-form-home.render";
import { env } from "~/env";

if (!env.RESEND_API_KEY) {
  throw new Error("Resend api not correct");
}
const resend = new Resend(env.RESEND_API_KEY);

export const sendLeaveRequest = async (
  leaveRequestsInput: any,
): Promise<{ data: any[] | null; error: PostgrestError | null }> => {
  const supabase = await createServerClient();
  const { error, data } = await supabase
    .from("leave_requests")
    .upsert(
      {
        name: leaveRequestsInput.name,
        user_id: leaveRequestsInput.userId,
        department_id: leaveRequestsInput.departmentId,
        reason: leaveRequestsInput.reason,
        start_date: leaveRequestsInput.startDate,
        end_date: leaveRequestsInput.endDate,
        approval_status: leaveRequestsInput.approvalStatus,
        status: leaveRequestsInput.status,
        approved_by: leaveRequestsInput.approvedBy,
        approved_at: leaveRequestsInput.approvedAt,
      },
      { onConflict: "user_id,id" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  const leaveRequestId = data.id;
  const htmlContent = await renderWFHEmail({
    name: leaveRequestsInput.name,
    department: leaveRequestsInput.departmentId,
    reason: leaveRequestsInput.reason,
    link: `${env.NEXT_PUBLIC_APP_URL}/leave-requests/${leaveRequestId}`,
  });

  await resend.emails.send({
    from: "HR System <delivered@resend.dev>",
    to: env.EMAIL_TO!,
    subject: `Đơn xin làm việc tại nhà - ${leaveRequestsInput.name}`,
    html: htmlContent,
  });
  return { data: [data], error };
};
