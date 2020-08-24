import { QuestionFile, makeUrl } from './question';
import renderContent from './questionContentRenderer';

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

export function renderQuestion(data: QuestionFile): string {
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


function removeHtmlTags(strx: string, size: number): string {
    let output = '';
    if (strx.indexOf("<") !== -1) {
        const s = strx.split("<");
        for (let i = 0; i < s.length; i++) {
            if (s[i].indexOf(">") !== -1) {
                s[i] = s[i].substring(s[i].indexOf(">")+1,s[i].length);
            }
        }
        output = s.join("");
    }
    let chop = (size < output.length - 1) ? size : output.length - 2;
    while(output.charAt(chop-1) !== ' ' && strx.indexOf(' ', chop) !== -1) {
        chop++;
    }
    output = output.substring(0, chop - 1);
    return output + '...';
}

export function renderQuestionSummary(data: QuestionFile): string {
    const output = ['<div class="question">'];
    let img = '';
    const content = data.content.map((item) => {
        if (item.type === 'image') {
            img = makeUrl(item.data as string, item.pathType);
        }
        return renderContent(item);
    }).join('');
    if (img !== '') {
        output.push(`<img src=${img} />`);
    }
    output.push(`<div class="content">${removeHtmlTags(content, 350)}</div>`);
    output.push('</div>');
    return output.join('\n');
}
