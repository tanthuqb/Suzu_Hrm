import { render } from "@react-email/render";

import WorkFromHomeEmailTemplate from "~/components/EmailTemplates/work-from-home";

export const renderWFHEmail = async ({
  name,
  department,
  reason,
  position,
  link,
}: {
  name: string;
  department: string;
  position: string;
  reason: string;
  link: string;
}) => {
  return await render(
    <WorkFromHomeEmailTemplate
      name={name}
      position={position}
      department={department}
      reason={reason}
      link={link}
    />,
    { pretty: true },
  );
};
