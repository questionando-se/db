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


const levels: (string | undefined)[] = ['easy', 'medium', 'hard', undefined];


let examsOutput: string[] = [
    '---',
    'layout: examsList',
    '---',
    '<div class="collection">',
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
    let examIndexOutput: string[] = [
        '---\n',
        'layout: yearsList\n',
        `exam: ${ex}\n`,
        '---\n\n',
        '<h4>Por ano de realização</h4>',
        '<div class="collection">'
    ];
    if (noYears.length > 0) {
        // paginate the questions without year
        paginateItems(outputPath, noYears, 'lists', 'exams', ex, 'sa');
        examIndexOutput.push(
            '<div class="collection-item">',
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
            examIndexOutput.push(
                '<div class="collection-item">',
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

    examIndexOutput.push('</div>', '<h4>Por dificuldade</h4>', '<div class="collection">');
    
    levels.forEach((level) => {
        const questionsByLevel = sorted.filter((item) => item.data.difficulty === level);
        let img = '';
        let text = '';
        let link = '';
        if (level === undefined) {
            img = '{{ site.url }}/assets/images/difficulty/no-classified.png';
            text = 'Não classificados';
            link = `{{ site.url }}/lists/exams/${ex}/noclassified`;
        } else if (level === 'easy') {
            img = '{{ site.url }}/assets/images/difficulty/easy.png';
            text = 'Fáceis';
            link = `{{ site.url }}/lists/exams/${ex}/${level}`;
        } else if (level === 'medium') {
            img = '{{ site.url }}/assets/images/difficulty/medium.png';
            text = 'Médias';
            link = `{{ site.url }}/lists/exams/${ex}/${level}`;
        } else {
            img = '{{ site.url }}/assets/images/difficulty/hard.png';
            text = 'Difíceis';
            link = `{{ site.url }}/lists/exams/${ex}/${level}`;
        }
        examIndexOutput.push(
            '<div class="collection-item">',
            '<div class="left">',
            `<img src="${img}" class="circle" />`,
            '</div>',
            '<div class="right">',
            `<a href="${link}">${text}</a>`,
            '</div>',
            '</div>'
        );
        paginateItems(outputPath, questionsByLevel, 'lists', 'exams', ex, level === undefined ? 'noclassified' : level);
    });

    examIndexOutput.push('</div>');

    examsOutput.push(`{% include exams/${ex}.html %}`);

    const yearsPathOutput = preparePath(outputPath, 'lists', 'exams', ex);
    const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
    fs.writeFileSync(yearsFileOutput, examIndexOutput.join(''));
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
