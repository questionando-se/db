import { ParsedPath } from 'path';
import fs from 'fs';

/**
 * Relative Path Url (To GitHub Repository).
 */
export const RELATIVE_URL = 'https://raw.githubusercontent.com/questionando-se/db/master/';

/**
 * Question Difficulty Levels.
 */
export const difficultyLevels: (string | undefined)[] = ['easy', 'medium', 'hard', undefined];

/**
 * Question Content Data.
 */
export interface QuestionFileContent {
    /**
     * Content Type.
     */
    type: string;
    /**
     * Content Data.
     */
    data: any;
    /**
     * Used to Images, indicate if the path is absolute or relative to this repository.
     */
    pathType?: 'relative' | 'absolute';
}

export interface VideoData {
    url: string;
    credits: string;
}

export interface ComplementaryData {
    videoUrl: string;
    credits?: string;
}

/**
 * Question File Data Information
 */
export interface QuestionFile {
    /**
     * Question Exam.
     */
    exam?: string;
    /**
     * Question Year.
     */
    year?: number;
    /**
     * Question Tags.
     */
    tags?: string[];
    /**
     * Question difficulty.
     */
    difficulty?: 'easy' | 'medium' | 'hard';
    /**
     * Question Content.
     */
    content: QuestionFileContent[];
    /**
     * Question Alternatives.
     */
    alternatives: QuestionFileContent[][];
    /**
     * Correct Alternative Index.
     */
    correct: number;
    /**
     * Question book.
     */
    notebook?: string;
    /**
     * Question Number.
     */
    number?: number;
    /**
     * Question Resolutions.
     */
    resolutions?: VideoData[];
    complementary?: (ComplementaryData)[];
}

/**
 * Question File Information.
 */
export interface QuestionFileInformation {
    /**
     * The Question File Path.
     */
    path: string;
    /**
     * The Question File Parsed Path.
     */
    parsed: ParsedPath;
    /**
     * The Question File Data.
     */
    data: QuestionFile;
}

/**
 * Create the url to images.
 * @param url The url.
 * @param type The url path type.
 */
export function makeUrl(url: string, type: 'relative' | 'absolute' | undefined): string {
    if (type === undefined || type === 'absolute') {
        return url;
    }
    return `${RELATIVE_URL}${url}`;
}

/**
 * Read Question File.
 * @param file the file path.
 */
export function parseQuestionFile(file: string): QuestionFile {
    const text = fs.readFileSync(file, 'utf-8').toString();
    const json = JSON.parse(text);
    return json as QuestionFile;
}
