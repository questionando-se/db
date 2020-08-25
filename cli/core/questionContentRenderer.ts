import { makeUrl, QuestionFileContent } from './question';

function renderText(content: QuestionFileContent): string {
    return `<p>${content.data as string}</p>`;
}

function renderImage(content: QuestionFileContent): string {
    const url = makeUrl(content.data as string, content.pathType);
    return `<img src="${url}" />`;
}

function renderUL(content: QuestionFileContent): string {
    const data = content.data as QuestionFileContent[];
    const output = ['<ul>'];
    output.push(
        ...data.map((item) => {
            return `<li>${renderContent(item)}</li>`;
        })
    );
    output.push('</ul>');
    return output.join('\n');
}

interface TableData {
    header?: boolean;
    span?: number;
    rowspan?: number;
    text: string;
};

function renderTable(content: QuestionFileContent): string {
    const data = content.data as TableData[][];
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
                if (col.rowspan !== undefined) {
                    html += ` rowspan="${col.rowspan}"`
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

export default function renderContent(content: QuestionFileContent): string {
    if (content.type === 'text') {
        return renderText(content);
    } else if (content.type === 'image') {
        return renderImage(content);
    } else if (content.type === 'ul') {
        return renderUL(content);
    } else if (content.type === 'table') {
        return renderTable(content);
    }
    return '';
}
