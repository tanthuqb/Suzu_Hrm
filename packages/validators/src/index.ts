import { z } from "zod";

const allowedDomains = ["@suzu.edu.vn", "@suzu.group"] as const;
export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);

export const isUUID = (val?: string) =>
  !!val &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    val,
  );

export const emailSchema = z
  .string({ required_error: "Email là bắt buộc" })
  .email("Email không đúng định dạng")
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return allowedDomains.some((domain) => lower.endsWith(domain));
    },
    {
      message: `Email phải thuộc một trong các domain: ${allowedDomains.join(", ")}`,
    },
  );
