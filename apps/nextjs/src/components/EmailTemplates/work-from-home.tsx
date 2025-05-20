import { Container } from "@react-email/container";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export default function WorkFromHomeEmailTemplate({
  name,
  department,
  reason,
  link,
}: {
  name: string;
  department: string;
  reason: string;
  link: string;
}) {
  return (
    <Html lang="vi">
      <Section
        style={{
          backgroundColor: "#f2f3f5",
          padding: "40px 0",
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <Section style={{ padding: "24px" }}>
            <Heading
              style={{
                marginBottom: "12px",
                fontSize: "20px",
                fontWeight: "500",
                color: "#202124",
              }}
            >
              Thư xin làm việc tại nhà
            </Heading>

            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", color: "#3c4043" }}
            >
              Kính gửi phòng nhân sự,
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", color: "#3c4043" }}
            >
              Tôi tên là <strong>{name}</strong>, hiện là nhân viên công tác tại
              bộ phận <strong>{department}</strong>.
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", color: "#3c4043" }}
            >
              Qua email này, tôi xin phép được gửi đơn xin làm việc tại nhà với
              lý do : <em>{reason}</em>.
            </Text>

            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", color: "#3c4043" }}
            >
              Rất mong phòng nhân sự xem xét và cho phép làm việc tại nhà theo
              quy định.
            </Text>

            <a href={link}>
              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: "1.5",
                  color: "#1a73e8",
                  textDecoration: "underline",
                }}
              >
                Xem chi tiết đơn xin làm việc tại nhà
              </Text>
            </a>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#3c4043",
                marginTop: "24px",
              }}
            >
              Trân trọng,
              <br />
              {name}
            </Text>
          </Section>
        </Container>
      </Section>
    </Html>
  );
}
