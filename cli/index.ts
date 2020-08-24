import path, { ParsedPath } from 'path';
import fs from 'fs';
import { renderQuestion, renderQuestionSummary } from './core/questionRenderer';
import { QuestionFile, QuestionFileInformation, parseQuestionFile } from './core/question';
import { paginateItems } from './core/pagination';
import { preparePath } from './utils/path';

const working = process.cwd();

const args = process.argv.slice(2);

let inputPath = '';
let outputPath = '';

for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    if (current === '--input') {
        if (i + 1 < args.length) {
            inputPath = args[i + 1];
            if (!fs.existsSync(inputPath)) {
                inputPath = path.join(working, inputPath);
            }
            i += 1;
        }
    } else if (current === '--output') {
        if (i + 1 < args.length) {
            outputPath = args[i + 1];
            if (!fs.existsSync(outputPath)) {
                outputPath = path.join(working, outputPath);
            }
            i += 1;
        }
    }
}

if (!fs.existsSync(inputPath) || !fs.existsSync(outputPath)) {
    console.error('the input or the output path not exists...');
    process.exit(1);
}

const inputQuestionFiles: QuestionFileInformation[] = [];
const pushedNames: string[] = [];

function parsePath(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach((s) => {
        const parsed = path.parse(s);
        const ext = parsed.ext.toLowerCase();
        if (ext === '.json') {
            if (!/q\d+/.test(parsed.name)) {
                console.error('the question not has correctly named: ' + parsed.name)
                process.exit(1);
            }
            if (pushedNames.indexOf(parsed.name) !== -1) {
                console.error('two questions with the same id: ' + parsed.name);
                process.exit(1);
            }
            pushedNames.push(parsed.name);
            const filePath = path.join(dir, s);
            inputQuestionFiles.push({
                path: filePath,
                parsed: path.parse(filePath),
                data: parseQuestionFile(filePath)
            });
        } else {
            parsePath(path.join(dir, s));
        }
    });
}

parsePath(inputPath);

const sorted = inputQuestionFiles.sort((a, b) => {
    const aId = a.parsed.name.replace('q', '');
    const bId = b.parsed.name.replace('q', '');
    if (aId < bId) {
        return - 1;
    } else if (aId > bId) {
        return 1;
    } else {
        console.error('two questions with the same id: ' + a.parsed.name);
        process.exit(1);
        return 0;
    }
});

const exams: string[] = [];

// write questions
sorted.forEach((item) => {
    if (item.data.exam) {
        if (exams.indexOf(item.data.exam) === -1) {
            exams.push(item.data.exam);
        }
    }
    const questionsPath = preparePath(outputPath, 'questions');
    const filePath = path.join(questionsPath, `${item.parsed.name}.html`);
    const content = renderQuestion(item.data);
    fs.writeFileSync(filePath, content);
});
paginateItems(outputPath, sorted, 'lists', 'all');




let examsOutput: string[] = [
    '---',
    'layout: examsList',
    '---',
    '<div class="exams-list">',
];
exams.forEach((ex) => {
    const years: number[] = [];
    const noYears: QuestionFileInformation[] = [];
    const questinonsByExam = sorted.filter((item) => {
        const is = item.data.exam === ex;
        if (is) {
            if (item.data.year) {
                if (years.indexOf(item.data.year) === -1) {
                    years.push(item.data.year);
                }
            } else {
                noYears.push(item);
            }
        }
        return is;
    });
    let yearsOutput: string[] = [
        '---\n',
        'layout: yearsList\n',
        `exam: ${ex}\n`,
        '---\n\n',
    ];
    if (noYears.length > 0) {
        // paginate the questions without year
        paginateItems(outputPath, noYears, 'lists', 'exams', ex, 'sa');
        yearsOutput.push(
            '<div class="year-item">',
            '<div class="left">',
            '<div class="marker circle">',
            '<span>S.A.</span>',
            '</div>',
            '</div>',
            '<div class="right">',
            `<a href="{{ site.url }}/lists/exams/${ex}/sa">Sem ano</a>`,
            '</div>',
            '</div>'
        );
    }
    years.forEach((y) => {
        const items = questinonsByExam.filter((item) => item.data.year === y);
        if (items.length > 0) {
            paginateItems(outputPath, items, 'lists', 'exams', ex, y.toString());
            yearsOutput.push(
                '<div class="year-item">',
                '<div class="left">',
                '<div class="marker circle">',
                `<span>${y}</span>`,
                '</div>',
                '</div>',
                '<div class="right">',
                `<a href="{{ site.url }}/lists/exams/${ex}/${y}">${y}</a>`,
                '</div>',
                '</div>'
            );
        }
    });
    examsOutput.push(`{% include exams/${ex}.html %}`);

    const yearsPathOutput = preparePath(outputPath, 'lists', 'exams', ex);
    const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
    fs.writeFileSync(yearsFileOutput, yearsOutput.join(''));
});
examsOutput.push('</div>');

const examsPath = preparePath(outputPath, 'lists', 'exams');
const fileExams = path.join(examsPath, 'index.html');
fs.writeFileSync(fileExams, examsOutput.join('\n'));

/*
const geometry = sorted.filter((item) => {
    if (!item.data.tags) {
        return false;
    }
    return (item.data.tags.indexOf('geometry') !== -1);
});

paginateItems(outputPath, geometry, 'tags', 'geometry');
*/
