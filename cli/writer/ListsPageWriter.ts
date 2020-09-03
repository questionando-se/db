import path from 'path';
import fs from 'fs';
import examsData from '../data/exams';
import { preparePath } from '../utils/path';
import { YearsPaginationOutput } from '../core/pagination';
import { makeUrl } from '../core/question';

export default class ListsPageWriter {
    private version: string;

    constructor(version: string) {
        this.version = version;
    }

    private getDifficultyItem(displayText: string, url: string, icon: string): string[] {
        return [
            '<div class="collection-item">',
            '   <div class="left">',
            `       <img src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/icons/difficulty/${icon}.png" class="circle" />`,
            '   </div>',
            '   <div class="right">',
            `       <a href="{{ site.url }}${url}">${displayText}</a>`,
            '   </div>',
            '</div>',
        ]
    }

    private getYearItem(isNoYears: boolean, year: string, url: string): string[] {
        if (isNoYears) {
            return [
                '<div class="collection-item">',
                '   <div class="left">',
                '       <div class="marker circle">',
                '           <span>S.A.</span>',
                '       </div>',
                '   </div>',
                '   <div class="right">',
                `       <a href="{{ site.url }}${url}/sa">Sem ano</a>`,
                '   </div>',
                '</div>'
            ];
        }
        return [
            '<div class="collection-item">',
            '   <div class="left">',
            '       <div class="marker circle">',
            `           <i class="material-icons">date_range</i>`,
            '       </div>',
            '   </div>',
            '   <div class="right">',
            `       <a href="{{ site.url }}${url}/${year}">${year}</a>`,
            '   </div>',
            '</div>'
        ];
    }

    public writeDifficultyList(outputPath: string) {
        const output = [
            '---\n',
            'layout: yearsList\n',
            '---\n\n',
            '<h4>Questões Por dificuldade</h4>',
            '<div class="collection">',
            ...this.getDifficultyItem('Não classificados', '/lists/difficulty/noclassified', 'no-classified'),
            ...this.getDifficultyItem('Fáceis', '/lists/difficulty/easy', 'easy'),
            ...this.getDifficultyItem('Médias', '/lists/difficulty/medium', 'medium'),
            ...this.getDifficultyItem('Difíceis', '/lists/difficulty/hard', 'hard'),
            '</div>'
        ];
        const pathOutput = preparePath(outputPath, 'lists', 'difficulty');
        const fileOutput = path.join(pathOutput, 'index.html');
        fs.writeFileSync(fileOutput, output.map((line) => line.trimLeft()).join(''));
    }

    public writeExamHome(outputPath: string, exam: string, yearsData: YearsPaginationOutput): void {
        const output = [
            '---\n',
            'layout: yearsList\n',
            `exam: ${exam}\n`,
            '---\n\n',
            '<div class="collection">',
            '   <div class="collection-item">',
            '       <div class="left"><div class="marker circle">',
            '           <i class="material-icons">format_list_bulleted</i>',
            '       </div></div>',
            '       <div class="right">',
            `           <a href="{{ site.url }}/lists/exams/${exam}/all">Todas as questões</a>`,
            '       </div>',
            '   </div>',
            '</div>',
            '<h4>Por ano de realização</h4>',
            '<div class="collection">'
        ];
        if (yearsData.hasWithoutYears) {
            output.push(...this.getYearItem(true, 's.a', `/lists/exams/${exam}`));
        }
        yearsData.years.forEach((y) => {
            output.push(...this.getYearItem(false, y.toString(), `/lists/exams/${exam}`));
        });
        output.push('</div>', '<h4>Por dificuldade</h4>', '<div class="collection">');
        output.push(
            ...this.getDifficultyItem('Não classificados', `/lists/exams/${exam}/noclassified`, 'no-classified'),
            ...this.getDifficultyItem('Fáceis', `/lists/exams/${exam}/easy`, 'easy'),
            ...this.getDifficultyItem('Médias', `/lists/exams/${exam}/medium`, 'medium'),
            ...this.getDifficultyItem('Difíceis', `/lists/exams/${exam}/hard`, 'hard'),
        );
        output.push('</div>');
        const yearsPathOutput = preparePath(outputPath, 'lists', 'exams', exam);
        const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
        fs.writeFileSync(yearsFileOutput, output.map((line) => line.trimLeft()).join(''));
    }

    public writeYearsList(outputPath: string, yearsData: YearsPaginationOutput) {
        const output = [
            '---\n',
            'layout: yearsList\n',
            '---\n\n',
            '<h4>Questões por Ano</h4>',
            '<div class="collection">'
        ];
        if (yearsData.hasWithoutYears) {
            output.push(
                ...this.getYearItem(true, 's.a.', '/lists/years')
            );
        }
        yearsData.years.forEach((y) => {
            output.push(
                ...this.getYearItem(false, y.toString(), '/lists/years')
            );
        });
        output.push('</div>');
        const yearsPathOutput = preparePath(outputPath, 'lists', 'years');
        const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
        fs.writeFileSync(yearsFileOutput, output.map((line) => line.trimLeft()).join(''));
    }

    public writeExamsList(outputPath: string, exams: string[]) {
        const output: string[] = [
            '---\n',
            'layout: examsList\n',
            '---\n\n',
            '<div class="collection">',
        ];
        exams.forEach((exam) => {
            const data = examsData[exam];
            output.push(
                '<div class="collection-item">',
                '   <div class="left">',
                `       <img src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/${data.image}" alt="" class="circle" />`,
                '   </div>',
                '   <div class="right">',
                `       <a href="{{ site.url }}/lists/exams/${exam}">${data.text}</a>`,
                `       <p>${data.longText}</p>`,
                '   </div>',
                '</div>'
            );
        });
        output.push('</div>');
        const examsPath = preparePath(outputPath, 'lists', 'exams');
        const fileExams = path.join(examsPath, 'index.html');
        fs.writeFileSync(fileExams, output.map((line) => line.trimLeft()).join(''));
    }
}
