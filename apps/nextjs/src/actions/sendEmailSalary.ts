"use server";

import { Resend } from "resend";

import { generateFullSalaryEmailHtml } from "~/components/SalaryPDFTemplates/emailEmplate";
import { renderSalarySlipToBuffer } from "~/components/SalaryPDFTemplates/renderSalarySlipToBuffer";
import { env } from "~/env";

export async function sendSalaryEmail(input: {
  email: string;
  data: any;
}): Promise<{ success: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: "Missing RESEND API key" };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const buffer = await renderSalarySlipToBuffer(input.data);
  const now = new Date();
  const currentYear = now.getFullYear();
  const formatted = `${input.data.month.toString().padStart(2, "0")}/${currentYear}`;

  try {
    await resend.emails.send({
      from: "SuZu Group HR System <delivered@resend.dev>",
      to: input.email,
      subject: `Phiếu lương tháng ${formatted} - ${input.data.name}`,
      html: generateFullSalaryEmailHtml(input.data),
      attachments: [
        {
          filename: `PhieuLuong-${input.data.name}-${input.data.month}.pdf`,
          content: buffer.toString("base64"),
        },
      ],
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
