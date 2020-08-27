import path from 'path';
import fs from 'fs';
import { QuestionFileInformation } from './question';
import { renderQuestionSummary } from './questionRenderer';
import { preparePath } from '../utils/path';
import tags from './tags';

interface BreadCrumb {
    exam?: string;
    year?: string;
    difficulty?: string;
    tag?: string;
}

function makeBreadCrumbData(data: BreadCrumb | null): string[] {
    if (!data) {
        return [];
    }
    const output: string[] = [];
    if (data.exam) {
        output.push(`exam: ${data.exam}`);
    }
    if (data.difficulty) {
        output.push(`difficulty: ${data.difficulty}`);
    }
    if (data.year) {
        output.push(`year: ${data.year}`);
    }
    if (data.tag) {
        output.push(`tag: ${data.tag}`);
        const title = tags[data.tag];
        if (title) {
            output.push(`tagText: ${title}`);
        }
    }
    return output;
}

export function paginateItems(
    basePath: string,
    items: QuestionFileInformation[],
    breadcrumbData: BreadCrumb | null,
    tagsLink: string,
    ...dirs: string[]
) {
    const outputPath = preparePath(basePath, ...dirs);
    const relUrl = dirs.join('/');
    const backLik = dirs.slice(0, dirs.length - 1).join('/');

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
        currentHtml += renderQuestionSummary(item.data, item.parsed.name, tagsLink);
        current += 1;
    });
    if (currentHtml !== '') {
        pagesHtml.push(currentHtml);
    } else if (pagesHtml.length === 0) {
        pagesHtml.push(
            '<div class="no-items"><div class="center"><i class="material-icons">bubble_chart</i></div><h4 class="center">Ops! Não existem questões cadastradas nessa página.</h4><div class="center">' +
            `<a href="{{ site.url }}/${backLik}" class="btn dash-primary">` +
            '<i class="material-icons left">chevron_left</i>Voltar</a></div></div>'
        );
    }

    const pagesCount = pagesHtml.length;
    pagesHtml.forEach((html, index) => {
        const currentPage = index + 1;
        const output = [
            '---',
            'layout: questionList',
            `currentPage: ${currentPage}`,
            `pagesCount: ${pagesCount}`,
            `relativePath: ${relUrl}`,
            `backPath': ${backLik}`,
            ...makeBreadCrumbData(breadcrumbData),
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

export function paginateTags(
    outputPath: string,
    items: QuestionFileInformation[],
    tagsPrefix: string,
    breadCrumbData: BreadCrumb,
    ...dirs: string[]
) {
    const tags: string[] = [];
    items.forEach((item) => {
        if (item.data.tags && item.data.tags.length > 0) {
            item.data.tags.forEach((tag) => {
                if (tags.indexOf(tag) === -1) {
                    tags.push(tag);
                }
            });
        }
    });
    tags.forEach((tag) => {
        const questionsByTag = items.filter((item) => {
            if (!item.data.tags) {
                return false;
            }
            return (item.data.tags.indexOf(tag) !== -1);
        });
        paginateItems(
            outputPath,
            questionsByTag,
            {
                ...breadCrumbData,
                tag
            },
            tagsPrefix,
            ...dirs, tag);
    });
}
