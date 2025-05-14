import React from "react";

const DepartmentLayout = (props: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">{props.children}</div>
  );
};

export default DepartmentLayout;
