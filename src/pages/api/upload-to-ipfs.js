// src/pages/api/uploadToIPFS.js
import pinataSDK from '@pinata/sdk';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,  // 禁用默认的 body 解析
  },
};

// 初始化 Pinata 实例
const pinata = pinataSDK(process.env.NEXT_PUBLIC_PINATA_API_KEY, process.env.NEXT_PUBLIC_PINATA_API_SECRET);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const { assetName, desc } = fields;
    const file = files.file;

    if (!file || !assetName || !desc) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // 读取文件并将其上传到 Pinata IPFS
      const filePath = file.filepath;
      const readableStream = fs.createReadStream(filePath);

      const fileResponse = await pinata.pinFileToIPFS(readableStream, {
        pinataMetadata: {
          name: assetName,
          keyvalues: {
            description: desc,
          },
        },
      });

      const fileCid = fileResponse.IpfsHash;

      // 创建 metadata，使用用户输入的 description
      const metadata = {
        name: assetName,
        description: desc,
        image: `ipfs://${fileCid}`,
      };

      // 上传 metadata 到 Pinata IPFS
      const metadataResponse = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: `${assetName}-metadata`,
        },
      });

      // 返回 metadata 的 CID
      return res.status(200).json({ metadataCid: metadataResponse.IpfsHash });
    } catch (error) {
      console.error('Error uploading to Pinata IPFS:', error);
      return res.status(500).json({ message: 'Failed to upload to Pinata' });
    }
  });
}
