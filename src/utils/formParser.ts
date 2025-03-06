import formidable, { Fields, Files } from "formidable";
import { IncomingMessage } from "http";
import path from "path";
import fs from "fs";

export const parseForm = (req: IncomingMessage): Promise<{ fields: Fields; file: formidable.File | null }> => {
  const uploadDir = path.join(process.cwd(), "public/uploads"); // مجلد التخزين

  // التأكد من وجود المجلد
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false, // رفع ملف واحد فقط
    uploadDir,
    keepExtensions: true, // الحفاظ على الامتداد
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      resolve({ fields, file: files.file ? files.file[0] : null });
    });
  });
};
