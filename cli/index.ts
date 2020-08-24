import path, { ParsedPath } from 'path';
import fs from 'fs';
import renderQuestion from './writer/question'

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

const inputQuestionFiles: {
    path: string;
    parsed: ParsedPath;
}[] = [];

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
            const filePath = path.join(dir, s);
            inputQuestionFiles.push({
                path: filePath,
                parsed: path.parse(filePath)
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

sorted.forEach((item) => {
    const questionsPath = path.join(outputPath, 'questions');
    if (!fs.existsSync(questionsPath)) {
        fs.mkdirSync(questionsPath);
        if (!fs.existsSync(questionsPath)) {
            console.error('can\'t create the questions path. make this manualy.')
            process.exit(1);
        }
    }
    const filePath = path.join(outputPath, 'questions', `${item.parsed.name}.html`);
    const content = renderQuestion(item.path);
    fs.writeFileSync(filePath, content);
});
