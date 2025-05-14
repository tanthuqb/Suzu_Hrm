import { render } from "@react-email/render";

import WorkFromHomeEmailTemplate from "~/components/EmailTemplates/work-from-home";

export const renderWFHEmail = async ({
  name,
  department,
  reason,
}: {
  name: string;
  department: string;
  reason: string;
}) => {
  return await render(
    <WorkFromHomeEmailTemplate
      name={name}
      department={department}
      reason={reason}
    />,
    { pretty: true },
  );
};
