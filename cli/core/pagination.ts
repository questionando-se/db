import path from 'path';
import fs from 'fs';
import { QuestionFileInformation, difficultyLevels } from './question';
import { renderQuestionSummary } from './questionRenderer';
import { preparePath } from '../utils/path';
import tags from './tags';

/**
 * Information to create BreadCrumb's.
 */
interface BreadCrumb {
    /**
     * Exam Name.
     */
    exam?: string;
    /**
     * Year Name.
     */
    year?: string;
    /**
     * Difficulty.
     */
    difficulty?: string;
    /**
     * Tag.
     */
    tag?: string;
}

/**
 * Years Pagination Output Information Data.
 */
export interface YearsPaginationOutput {
    /**
     * The Paginated Years.
     */
    years: number[];
    /**
     * A value indicating if has Questions Withtout Years.
     */
    hasWithoutYears: boolean;
}

/**
 * create the breadcrumb information from data.
 * @param data the breadcrumb data.
 */
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

/**
 * paginate items.
 * @param basePath the base path to join.
 * @param items the items to paginate.
 * @param breadcrumbData the breadcrumb data.
 * @param tagsLink the tags link base.
 * @param dirs the directories.
 */
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

/**
 * paginate the tags of items.
 * @param outputPath the output path to join.
 * @param items the items to paginate.
 * @param tagsPrefix the tags link prefix.
 * @param breadCrumbData the breadcrumb data.
 * @param dirs the directories.
 */
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

/**
 * paginate the items by exam.
 * @param outputPath the output path to join.
 * @param root the root link.
 * @param exam the exam name.
 * @param items the items to use.
 * @param dirs the directories.
 */
export function byExam(
    outputPath: string,
    root: string,
    exam: string,
    items: QuestionFileInformation[],
    ...dirs: string[]
) {
    const questinonsByExam = items.filter((item) => item.data.exam === exam);
    paginateItems(
        outputPath,
        questinonsByExam,
        {
            exam,
        },
        `${root}/${exam}`,
        ...dirs, exam, 'all'
    );
    return questinonsByExam;
}

/**
 * paginate the items by years.
 * @param outputPath the output path to join.
 * @param root the root link.
 * @param breadCrumbData the breadcrumb data.
 * @param items the items to use.
 * @param dirs the directories.
 */
export function byYears(
    outputPath: string,
    root: string,
    breadCrumbData: BreadCrumb,
    items: QuestionFileInformation[],
    ...dirs: string[]
) : YearsPaginationOutput {
    const years: number[] = [];
    const noYears: QuestionFileInformation[] = [];
    items.forEach((item) => {
        if (item.data.year) {
            if (years.indexOf(item.data.year) === -1) {
                years.push(item.data.year);
            }
        } else {
            noYears.push(item);
        }
    });
    if (noYears.length > 0) {
        // paginate the questions without year
        paginateItems(
            outputPath,
            noYears,
            {
                ...breadCrumbData,
                year: 'sa'
            },
            `${root}/sa`,
            ...dirs, 'sa'
        );
    }
    const usedYears: number[] = [];
    years.forEach((y) => {
        const yearItems = items.filter((item) => item.data.year === y);
        if (yearItems.length > 0) {
            usedYears.push(y);
            const year = y.toString();
            paginateItems(
                outputPath,
                yearItems,
                {
                    ...breadCrumbData,
                    year,
                },
                `${root}/${y}`,
                ...dirs, year
            );
            paginateTags(
                outputPath,
                yearItems,
                `${root}/${y}`,
                {
                    ...breadCrumbData,
                    year,
                },
                ...dirs, year, 'tags'
            );
        }
    });
    return {
        years: usedYears,
        hasWithoutYears: (noYears.length > 0)
    };
}

/**
 * paginate the items by difficulty.
 * @param outputPath the output path to join.
 * @param root the root link.
 * @param breadCrumbData the breadcrumb data.
 * @param items the items to use.
 * @param dirs the directories.
 */
export function byDifficulty(
    outputPath: string,
    root: string,
    breadCrumbData: BreadCrumb,
    items: QuestionFileInformation[],
    ...dirs: string[]
) {
    difficultyLevels.forEach((level) => {
        const questionsByLevel = items.filter((item) => item.data.difficulty === level);
        paginateItems(
            outputPath,
            questionsByLevel,
            {
                ...breadCrumbData,
                difficulty: level === undefined ? 'noclassified' : level
            },
            root,
            ...dirs, level === undefined ? 'noclassified' : level
        );
    });
}
