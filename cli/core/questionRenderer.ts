import { QuestionFile, makeUrl } from './question';
import renderContent from './questionContentRenderer';

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
    if (data.difficulty !== undefined) {
        output.push(`difficulty: ${data.difficulty}`);
    }
    output.push(
        `correct: ${data.correct}`,
        '---',
        '',
        '',
        '<div class="question-body">',
        ...data.content.map((item) => renderContent(item)),
        '</div>',
        '<div class="question-options">'
    );
    data.alternatives.forEach((alt) => {
        output.push(
            '<div class="option-item">',
            '<label>',
            `<input name="question-alternative" type="radio" />`,
            '<span>',
            ...alt.map((item) => renderContent(item)),
            '</span>',
            '</label>',
            '</div>',
        );
    });
    output.push('</div>');
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

export function renderQuestionSummary(data: QuestionFile, id: string): string {
    const output = [
        '<div class="question">',
        '<div class="question-header">',
        `<a class="question-title" href="{{ site.url }}/questions/${id}.html">`
    ];
    if (data.exam) {
        output.push(data.exam);
    }
    if (data.year) {
        output.push(` ${data.year}`);
    }
    if (data.exam === 'ENEM') {
        if (data.number && data.notebook) {
            output.push(` - Questão ${data.number} Caderno ${data.notebook}`);
        }
    }
    if (data.difficulty) {
        if (data.difficulty === 'easy') {
            output.push(' - Fácil');
        } else if (data.difficulty === 'medium') {
            output.push(' - Média');
        } else {
            output.push(' - Difícil');
        }
    }
    output.push('</a>');
    if (data.tags && data.tags.length > 0) {
        output.push('<div class="tags">');
        data.tags.forEach((tag) => output.push(`<span class="tag">${tag}</div>`));
        output.push('</div>');
    }

    output.push('</div><div class="question-body">');
    let img = '';
    const content = data.content.map((item) => {
        if (item.type === 'image') {
            img = makeUrl(item.data as string, item.pathType);
        }
        if (item.type !== 'text') {
            return '';
        }
        return renderContent(item);
    }).join('');
    if (img !== '') {
        output.push(`<img src=${img} />`);
    }
    output.push(`<div class="content">${removeHtmlTags(content, 150)}</div>`);
    output.push('</div>');
    output.push('</div>');
    return output.join('');
}
