export const generateFullSalaryEmailHtml = (data: any): string => {
  return `
  <div style="font-family: 'Roboto', sans-serif; font-size: 14px; color: #000;">
    <p style="color: #880e4f;">Chào bạn,</p>
    <p style="color: #880e4f;">
      Phòng HR gửi bạn phiếu lương tháng <strong>${data.month ?? "3/2025"}</strong><br />
      Bạn vui lòng xem chi tiết bên dưới hoặc mở file đính kèm.
    </p>

   

    <p style="color: #880e4f;">
      Nếu có thắc mắc, vui lòng liên hệ Đinh Khánh qua Facebook / Zalo / SĐT 0905085606.
    </p>
    <p style="color: #880e4f;" >---Thanks & regards!</p>

    <hr style="margin: 20px 0;" />

    <table cellpadding="0" cellspacing="0" style="width: 100%; font-size: 13px;">
      <tr>
        <td style="width: 80px;">
          <img src="https://i.imgur.com/Btw9IAt.png" width="64" height="64" style="border-radius: 8px;" alt="logo" />
        </td>
        <td style="padding-left: 10px;">
          <p style="margin: 0; font-weight: bold;">Human Resources Department</p>
          <p style="margin: 0;">SuZu Group</p>
          <p style="margin: 0;">A: 265/40 No Trang Long St., Ward 11, Binh Thanh Dist., HCMC</p>
          <p style="margin: 0;">E: <a href="mailto:hr@suzu.vn">hr@suzu.vn</a></p>
        </td>
      </tr>
    </table>
  </div>
  `;
};
