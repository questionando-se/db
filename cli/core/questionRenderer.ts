import { QuestionFile, makeUrl } from './question';
import renderContent from './questionContentRenderer';
import tags from '../data/tags';
import examsData from '../data/exams';

/**
 * Render full question document.
 * @param data the parsed QuestionFile.
 */
export function renderQuestion(data: QuestionFile): string {
    let output: string[] = [
        '---\n',
        'layout: question\n',
    ];
    if (data.exam !== undefined) {
        output.push(`exam: ${data.exam}\n`);
        const examData = examsData[data.exam];
        output.push(`title: ${examData.writeQuestionTitle(data)}\n`);
    }
    if (data.year !== undefined) {
        output.push(`year: ${data.year}\n`);
    }
    if (data.tags !== undefined) {
        output.push(`tags: ${data.tags.join(', ')}\n`);
    }
    if (data.difficulty !== undefined) {
        output.push(`difficulty: ${data.difficulty}\n`);
    }
    output.push(
        `correct: ${data.correct}\n`,
        '---\n\n',
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
    return output.join('');
}

/**
 * remove html tags to create an summary.
 * @param strx the content string.
 * @param size the summary size.
 */
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

/**
 * 
 * @param data the parsed QuestionFile.
 * @param id the QuestionFile id.
 * @param tagPrefix the tag link prefix.
 */
export function renderQuestionSummary(data: QuestionFile, id: string, tagPrefix: string): string {
    if (!data.exam) {
        return '';
    }
    const examData = examsData[data.exam];
    const output = [
        '<div class="question">',
        '<div class="question-header">',
        `<a class="question-title" href="{{ site.url }}/questions/${id}.html">`,
        examData.writeQuestionTitle(data),
        '</a>'
    ];
    if (data.tags && data.tags.length > 0) {
        output.push('<div class="tags">');
        data.tags.forEach((tag) => {
            const title = tags[tag];
            if (!title) {
                console.warn(`tag "${tag}" not found.`);
                return;
            }
            output.push(`<a href="{{ site.url }}/${tagPrefix}/tags/${tag}" class="tag">${title}</a>`)
        });
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
