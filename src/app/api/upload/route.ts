import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { IncomingForm, File } from 'formidable';
import { IncomingMessage } from 'http';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), '/uploads');

const parseForm = async (req: IncomingMessage): Promise<{ filePath: string }> => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const form = new IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                const file = Array.isArray(files.file) ? files.file[0] : files.file as File | undefined;
                if (!file) {
                    reject(new Error('File not found'));
                } else {
                    const filePath = path.join(uploadDir, file.newFilename);
                    fs.renameSync(file.filepath, filePath);
                    resolve({ filePath });
                }
            }
        });
    });
};

export async function POST(req: Request) {
    try {
        // Convert Next.js Request to IncomingMessage
        const request = new (class extends IncomingMessage {
            constructor() {
                super(req as any);
            }
        })();

        const data = await parseForm(request);
        return NextResponse.json({ filePath: data.filePath });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
