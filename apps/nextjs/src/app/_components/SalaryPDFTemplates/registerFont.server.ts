import path from "path";
import { Font } from "@react-pdf/renderer";

export const registerFontForServer = () => {
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: path.resolve("public/fonts/Roboto/Roboto-Regular.ttf"),
        fontWeight: "normal",
      },
      {
        src: path.resolve("public/fonts/Roboto/Roboto-Bold.ttf"),
        fontWeight: "bold",
      },
      {
        src: path.resolve("public/fonts/Roboto/Roboto-Italic.ttf"),
        fontStyle: "italic",
      },
      {
        src: path.resolve("public/fonts/Roboto/Roboto-BoldItalic.ttf"),
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
};
