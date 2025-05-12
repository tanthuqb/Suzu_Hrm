import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Roboto",
  },
  section: { marginBottom: 10 },
  heading: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
    borderBottom: "1 solid black",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: {
    width: "70%",
  },
  value: {
    width: "30%",
    textAlign: "right",
  },
  total: {
    fontWeight: "bold",
    marginTop: 5,
    borderTop: "1 solid black",
    paddingTop: 2,
  },
});

export const SalarySlipPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        PHIẾU LƯƠNG - Tháng 3/2025
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Họ tên</Text>
        <Text style={styles.value}>Hoàng Công Lộc</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ngày công trong tháng</Text>
        <Text style={styles.value}>26</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ngày công thực tế</Text>
        <Text style={styles.value}>21</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>A. THU NHẬP</Text>
        <View style={styles.row}>
          <Text style={styles.label}>1. Lương cơ bản</Text>
          <Text style={styles.value}>10,000,000</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>2. Lương ngày công</Text>
          <Text style={styles.value}>8,076,923</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>3. Thưởng</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>4. Phụ cấp</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>5. Khác</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.label}>6. Tổng thu nhập</Text>
          <Text style={styles.value}>8,076,923</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>B. KHẤU TRỪ</Text>

        <Text style={{ fontWeight: "bold" }}>I. BHXH</Text>
        <View style={styles.row}>
          <Text style={styles.label}>7. Mức lương đóng BHXH</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>8. Trừ BHXH (10.5%)</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>9. Trừ phí công đoàn 1%</Text>
          <Text style={styles.value}>-</Text>
        </View>

        <Text style={{ fontWeight: "bold", marginTop: 5 }}>II. Thuế TNCN</Text>
        <View style={styles.row}>
          <Text style={styles.label}>10. Mức lương áp thuế</Text>
          <Text style={styles.value}>8,076,923</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>11. Giảm trừ bản thân</Text>
          <Text style={styles.value}>11,000,000</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>12. Giảm trừ gia cảnh</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>13. Mức lương chịu thuế</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>14. Trừ thuế TNCN</Text>
          <Text style={styles.value}>-</Text>
        </View>

        <Text style={{ fontWeight: "bold", marginTop: 5 }}>III. Khác</Text>
        <View style={styles.row}>
          <Text style={styles.label}>15. Trừ tạm ứng</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>16. Khác</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.label}>17. Tổng khấu trừ</Text>
          <Text style={styles.value}>-</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>C. THỰC LÃNH LƯƠNG</Text>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.label}>18. Thu nhập thực lãnh</Text>
          <Text style={styles.value}>8,076,923</Text>
        </View>
      </View>

      <Text style={{ marginTop: 20, fontSize: 10, fontStyle: "italic" }}>
        Chú giải: Nhân viên đi làm lại
      </Text>
    </Page>
  </Document>
);
