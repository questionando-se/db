import { ParsedPath } from 'path';
import fs from 'fs';

export const RELATIVE_URL = 'https://raw.githubusercontent.com/questionando-se/db/master/';

export interface QuestionFileContent {
    type: string;
    data: any;
    pathType?: 'relative' | 'absolute';
}

export interface QuestionFile {
    exam?: string;
    year?: number;
    tags?: string[];
    content: QuestionFileContent[];
    alternatives: QuestionFileContent[][];
    correct: number;
}

export interface QuestionFileInformation {
    path: string;
    parsed: ParsedPath;
    data: QuestionFile;
}

export function makeUrl(url: string, type: 'relative' | 'absolute' | undefined): string {
    if (type === undefined || type === 'absolute') {
        return url;
    }
    return `${RELATIVE_URL}${url}`;
}

export function parseQuestionFile(file: string): QuestionFile {
    const text = fs.readFileSync(file, 'utf-8').toString();
    const json = JSON.parse(text);
    return json as QuestionFile;
}
