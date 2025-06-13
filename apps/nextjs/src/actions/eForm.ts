"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";

import { createServerClient } from "@acme/supabase";

import { renderWFHEmail } from "~/components/EmailTemplates/work-form-home.render";
import { env } from "~/env";
import { logger } from "~/libs/logger";

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
    .insert({
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
    })
    .select("id")
    .single();

  if (error) {
    logger.error("Error inserting leave request", {
      error,
    });
    throw new Error(error.message);
  }
  const leaveRequestId = data.id;
  const htmlContent = await renderWFHEmail({
    name: leaveRequestsInput.name,
    department: leaveRequestsInput.userInDepartment,
    position: leaveRequestsInput.position,
    reason: leaveRequestsInput.reason,
    link: `${env.NEXT_PUBLIC_APP_URL}/leave-requests/${leaveRequestId}`,
  });
  //const toEmails = env.EMAIL_TO!.split(",").map((e) => e.trim());

  // const batchPayload = toEmails.map((email) => ({
  //   from: "HR System <delivered@resend.dev>",
  //   to: toEmails,
  //   subject: `Đơn xin làm việc tại nhà - ${leaveRequestsInput.name}`,
  //   html: htmlContent,
  // }));

  // await resend.batch.send(batchPayload);
  const sendEmail = await resend.emails.send({
    from: "HR System <delivered@resend.dev>",
    to: env.EMAIL_TO!,
    subject: `Đơn xin làm việc tại nhà - ${leaveRequestsInput.name}`,
    html: htmlContent,
  });
  if (sendEmail.error) {
    logger.error("Error sending email", {
      error: sendEmail.error,
    });
  } else {
    logger.info("Email sent successfully", {
      sendEmail,
    });
  }
  return { data: [data], error };
};
