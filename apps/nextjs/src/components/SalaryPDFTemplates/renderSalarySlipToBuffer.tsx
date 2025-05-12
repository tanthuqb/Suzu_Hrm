import { renderToBuffer } from "@react-pdf/renderer";

import { registerFontForServer } from "./registerFont.server";
import { SalarySlipPDF } from "./SalarySlipPDF";

export const renderSalarySlipToBuffer = async (data: any): Promise<Buffer> => {
  registerFontForServer();
  const buffer = await renderToBuffer(<SalarySlipPDF data={data} />);
  return buffer;
};
