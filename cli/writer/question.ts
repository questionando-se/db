import fs from 'fs';

const RELATIVE_URL = 'http://10.0.0.103:8080/'; // TODO: change this to github
const ALPHABET = [
    'A', 'B', 'C',
    'D', 'E', 'F',
    'G', 'H', 'I',
    'J', 'K', 'L',
    'M', 'N', 'O',
    'P', 'Q', 'R',
    'S', 'T', 'U',
    'V', 'W', 'X',
    'Y', 'Z'
];

interface QuestionContent {
    type: string;
    data: any;
    pathType?: 'relative' | 'absolute';
}

interface QuestionFile {
    exam?: string;
    year?: number;
    tags?: string[];
    content: QuestionContent[];
    alternatives: QuestionContent[][];
    correct: number;
}

function read(file: string): QuestionFile {
    const text = fs.readFileSync(file, 'utf-8').toString();
    const json = JSON.parse(text);
    return json as QuestionFile;
}

function makeUrl(url: string, type: 'relative' | 'absolute' | undefined) {
    if (type === undefined || type === 'absolute') {
        return url;
    }
    return `${RELATIVE_URL}${url}`;
}

function renderContent(content: QuestionContent): string {
    if (content.type === 'text') {
        return `<p>${content.data}</p>`;
    } else if (content.type === 'image') {
        const url = makeUrl(content.data as string, content.pathType);
        return `<img src="${url}" />`;
    } else if (content.type === 'ul') {
        const data = content.data as QuestionContent[];
        const output = ['<ul>'];
        output.push(
            ...data.map((item) => {
                return `<li>${renderContent(item)}</li>`;
            })
        );
        output.push('</ul>');
        return output.join('\n');
    } else if (content.type === 'table') {
        const data = content.data as {
            header?: boolean;
            span?: number;
            text: string;
        }[][];
        const output = ['<table>'];
        data.forEach((row) => {
            output.push('<tr>');
            output.push(
                ...row.map((col) => {
                    let html = '<';
                    let close = '>';
                    if (col.header !== undefined && col.header) {
                        html += 'th';
                        close = '</th>';
                    } else {
                        html += 'td';
                        close = '</td>';
                    }
                    if (col.span !== undefined) {
                        html += ` colspan="${col.span}"`
                    }
                    html += `>${col.text}${close}`;
                    return html;
                })
            );
            output.push('</tr>');
        });
        output.push('</table>');
        return output.join('\n');
    }
    return '';
}

export default function renderQuestion(file: string) {
    const data = read(file);
    let output: string[] = [
        '---',
        'layout: question',
    ];
    if (data.exam !== undefined) {
        output.push(`exam: ${data.exam}`);
    }
    if (data.year !== undefined) {
        output.push(`year: ${data.year}`);
    }
    if (data.tags !== undefined) {
        output.push(`tags: ${data.tags.join(', ')}`);
    }
    output.push(
        `correct: ${data.correct}`,
        '---',
        '',
        ''
    );
    output.push(
        ...data.content.map((item) => renderContent(item))
    );
    output.push('<ul class="options">');
    data.alternatives.forEach((alt, index) => {
        output.push('<li>');
        output.push(`<span class="indicator">${ALPHABET[index]}</span>`);
        output.push(
            ...alt.map((item) => renderContent(item))
        );
        output.push('</li>');
    });
    output.push('</ul>');
    return output.join('\n');
}
