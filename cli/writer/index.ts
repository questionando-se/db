import path from 'path';
import fs from 'fs';
import HomePageWriter from './HomePageWriter';
import IncludesWriter from './IncludesWriter';
import LayoutsWriter from './LayoutsWriter';
import ListsPageWriter from './ListsPageWriter';
import { QuestionFileInformation } from '../core/question';
import { preparePath } from '../utils/path';
import { renderQuestion } from '../core/questionRenderer';
import * as Paginator from '../core/pagination';

export default class SiteCreator {
    private homePath: string;
    private version: string;
    private listsWriter: ListsPageWriter;

    constructor(homePath: string, version: string) {
        this.homePath = homePath;
        this.version = version;
        this.listsWriter = new ListsPageWriter(version);
    }

    private makeExamList(exam: string, items: QuestionFileInformation[]): void {
        const questinonsByExam = Paginator.byExam(
            this.homePath,
            'lists/exams',
            exam,
            items,
            'lists', 'exams'
        );
        Paginator.paginateTags(
            this.homePath,
            questinonsByExam,
            `lists/exams/${exam}`,
            {
                exam
            },
            'lists', 'exams', exam, 'tags'
        );
        const yearsData = Paginator.byYears(
            this.homePath,
            `lists/exams/${exam}`,
            {
                exam,
            },
            questinonsByExam,
            'lists', 'exams', exam
        );
        Paginator.byDifficulty(
            this.homePath,
            `lists/exams/${exam}`,
            {
                exam,
            },
            questinonsByExam,
            'lists', 'exams', exam
        );
        this.listsWriter.writeExamHome(this.homePath, exam, yearsData);
    }

    public makeLists(exams: string[], items: QuestionFileInformation[]) {
        const byYearsData = Paginator.byYears(
            this.homePath,
            'lists/years',
            {},
            items,
            'lists', 'years'
        );
        this.listsWriter.writeYearsList(this.homePath, byYearsData);
        Paginator.byDifficulty(
            this.homePath,
            'lists',
            {},
            items,
            'lists', 'difficulty'
        );
        this.listsWriter.writeDifficultyList(this.homePath);
        Paginator.paginateTags(
            this.homePath,
            items,
            'lists',
            {},
            'lists', 'tags'
        );
        exams.forEach((exam) => {
            this.makeExamList(exam, items);
        });
        this.listsWriter.writeExamsList(this.homePath, exams);
    }

    public makeQuestions(items: QuestionFileInformation[]): string[] {
        const exams: string[] = [];
        // write questions
        items.forEach((item) => {
            if (item.data.exam) {
                if (exams.indexOf(item.data.exam) === -1) {
                    exams.push(item.data.exam);
                }
            }
            const questionsPath = preparePath(this.homePath, 'questions');
            const filePath = path.join(questionsPath, `${item.parsed.name}.html`);
            const content = renderQuestion(item.data);
            fs.writeFileSync(filePath, content);
        });
        return exams;
    }

    public makeStaticFiles(items: QuestionFileInformation[]): void {
        const home = new HomePageWriter(items);
        home.write(this.homePath);
        const includes = new IncludesWriter();
        includes.write(this.homePath);
        const layouts = new LayoutsWriter(this.version);
        layouts.write(this.homePath);
    }
}
