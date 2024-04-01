import type { NextApiRequest, NextApiResponse } from 'next';
import { WeaviateStore } from "@langchain/weaviate";
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import client from '../../../lib/weaviate';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const form = new IncomingForm();
      const { files } = await new Promise<{ fields: Fields; files: Files }>(
        (resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
          });
        }
      );

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!uploadedFile || !uploadedFile.filepath) {
        throw new Error('No file uploaded');
      }

      const loader = new PDFLoader(uploadedFile.filepath);
      const docs = await loader.load();

      // Create a vector store using Weaviate
      await WeaviateStore.fromDocuments(
        docs,
        new OpenAIEmbeddings(),
        {
          client,
          indexName: "PDFDocuments",
          textKey: "text",
          metadataKeys: ["source"],
        }
      );

      // Remove the temporary file
      fs.unlinkSync(uploadedFile.filepath);

      res.status(200).json({ message: 'File saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving file' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
