import path from 'path';
import fs from 'fs';
import { QuestionFileInformation } from './question';
import { renderQuestionSummary } from './questionRenderer';
import { preparePath } from '../utils/path';

export function paginateItems(
    basePath: string,
    items: QuestionFileInformation[],
    ...dirs: string[]
) {
    const outputPath = preparePath(basePath, ...dirs);

    let current = 0;
    let max_per_page = 10;
    let currentHtml = '';
    let pagesHtml: string[] = [];
    items.forEach((item) => {
        if (current >= max_per_page) {
            current = 0;
            pagesHtml.push(currentHtml);
            currentHtml = '';
        }
        currentHtml += renderQuestionSummary(item.data);
        current += 1;
    });
    if (currentHtml !== '') {
        pagesHtml.push(currentHtml);
    }

    const pagesCount = pagesHtml.length;
    pagesHtml.forEach((html, index) => {
        const currentPage = index + 1;
        const output = [
            '---',
            'layout: questionList',
            `currentPage: ${currentPage}`,
            `pagesCount: ${pagesCount}`,
            '---',
        ];
        let filePath = path.join(outputPath, 'index.html');
        if (currentPage !== 1) {
            filePath = path.join(outputPath, `p${currentPage}.html`);
        }
        const content = output.join('\n') + '\n' + html;
        fs.writeFileSync(filePath, content);
    });
}
