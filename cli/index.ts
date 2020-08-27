import path from 'path';
import fs from 'fs';
import { renderQuestion } from './core/questionRenderer';
import { QuestionFileInformation, parseQuestionFile } from './core/question';
import * as Paginator from './core/pagination';
import { preparePath } from './utils/path';

import * as StaticWriter from './writer/staticPageWriter';

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
Paginator.paginateItems(
    outputPath,
    sorted,
    null,
    `/lists`,
    'lists', 'all'
);

exams.forEach((exam) => {
    const questinonsByExam = Paginator.byExam(
        outputPath,
        'lists/exams',
        exam,
        sorted,
        'lists', 'exams'
    );
    Paginator.paginateTags(
        outputPath,
        questinonsByExam,
        `/lists/exams/${exam}`,
        {
            exam
        },
        'lists', 'exams', exam, 'tags'
    );
    const yearsData = Paginator.byYears(
        outputPath,
        `lists/exams/${exam}`,
        {
            exam,
        },
        questinonsByExam,
        'lists', 'exams', exam
    );
    Paginator.byDifficulty(
        outputPath,
        `lists/exams/${exam}`,
        {
            exam,
        },
        questinonsByExam,
        'lists', 'exams', exam
    );
    StaticWriter.examHome(
        outputPath,
        exam,
        yearsData
    );
});
StaticWriter.examsList(outputPath, exams);
