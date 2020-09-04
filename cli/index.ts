import path from 'path';
import fs from 'fs';
import { execSync, spawnSync } from 'child_process';
import { QuestionFileInformation, parseQuestionFile } from './core/question';
import SiteCreator from './writer';
import ArgParser from './argParser';

const working = process.cwd();
function makeWorkingDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return path.join(working, dir);
    }
    return dir;
}

const args = new ArgParser();
const inputPath = makeWorkingDir(args.getArg('input', ''));
const outputPath = makeWorkingDir(args.getArg('output', ''));
const version = args.getArg('version', '0.0.2');
const git = args.getArg('git', '');

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

function deleteOld() {
    fs.rmdirSync(path.join(outputPath, '_includes'), { recursive: true });
    fs.rmdirSync(path.join(outputPath, '_layouts'), { recursive: true });
    fs.rmdirSync(path.join(outputPath, 'lists'), { recursive: true });
    fs.rmdirSync(path.join(outputPath, 'questions'), { recursive: true });
    fs.rmdirSync(path.join(outputPath, '_site'), { recursive: true });
}
deleteOld();

const creator = new SiteCreator(outputPath, version);
creator.makeStaticFiles(sorted);
const exams = creator.makeQuestions(sorted);
creator.makeLists(exams, sorted);

function recreateGit() {
    if (git === '') {
        return;
    }
    // delete the git
    fs.rmdirSync(path.join(outputPath, '.git'), {
        recursive: true
    });
    execSync([
        `cd "${outputPath}"`,
        'git init',
        `git remote add origin ${git}`,
        'git add .',
        'git commit -m "Automatized build from CLI"',
        'git push origin master --force'
    ].join('\n'));
}
recreateGit();
