"use server";

import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

interface State {
  message: string | null;
  url: string | null;
}

export async function uploadFile(
  prevState: State | null,
  formData: FormData,
): Promise<State> {
  const file = formData.get("file") as File;

  if (!file) {
    return { message: "Please select a file", url: null };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { message: "File size exceeds 5MB", url: null };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      message: "Invalid file type. Allowed types: JPEG, PNG, GIF",
      url: null,
    };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `public/uploads/${fileName}`;

  try {
    await fs.writeFile(filePath, buffer);
    return {
      message: "File uploaded successfully!",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { message: "Failed to upload file", url: null };
  }
}
