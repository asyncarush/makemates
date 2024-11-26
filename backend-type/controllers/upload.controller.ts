import { Request, Response } from 'express';
import { uploadFile } from '../services/minio.service';

export const uploadFileController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = req.body.fileName || `${Date.now()}-${req.file.originalname}`;
        const url = await uploadFile(req.file, fileName);

        res.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};
