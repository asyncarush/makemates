import { Request, Response } from 'express';
import { uploadFile, MinioServiceError } from '../services/minio.service';

export const uploadFileController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }

        const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const url = await uploadFile(req.file, fileName);

        res.json({ 
            success: true,
            url 
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        if (error instanceof MinioServiceError) {
            return res.status(400).json({ 
                success: false,
                error: error.message 
            });
        }

        res.status(500).json({ 
            success: false,
            error: 'Internal server error while uploading file' 
        });
    }
};
