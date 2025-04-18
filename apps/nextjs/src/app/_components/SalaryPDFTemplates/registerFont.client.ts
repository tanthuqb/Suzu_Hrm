import { Font } from "@react-pdf/renderer";

export const registerFontForClient = () => {
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "/fonts/Roboto/Roboto-Regular.ttf",
        fontWeight: "normal",
      },
      {
        src: "/fonts/Roboto/Roboto-Bold.ttf",
        fontWeight: "bold",
      },
      {
        src: "/fonts/Roboto/Roboto-Italic.ttf",
        fontStyle: "italic",
      },
      {
        src: "/fonts/Roboto/Roboto-BoldItalic.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
};
