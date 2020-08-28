import path from 'path';
import fs from 'fs';
import { preparePath } from '../utils/path';
import { YearsPaginationOutput } from '../core/pagination';

export function examHome(
    outputPath: string,
    exam: string,
    yearsData: YearsPaginationOutput,
) {
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
        output.push(
            '<div class="collection-item">',
            '   <div class="left">',
            '       <div class="marker circle">',
            '           <span>S.A.</span>',
            '       </div>',
            '   </div>',
            '   <div class="right">',
            `       <a href="{{ site.url }}/lists/exams/${exam}/sa">Sem ano</a>`,
            '   </div>',
            '</div>'
        );
    }
    yearsData.years.forEach((y) => {
        output.push(
            '<div class="collection-item">',
            '   <div class="left">',
            '       <div class="marker circle">',
            `           <i class="material-icons">date_range</i>`,
            '       </div>',
            '   </div>',
            '   <div class="right">',
            `       <a href="{{ site.url }}/lists/exams/${exam}/${y}">${y}</a>`,
        '       </div>',
            '</div>'
        );
    });
    output.push('</div>', '<h4>Por dificuldade</h4>', '<div class="collection">');
    output.push(
        '<div class="collection-item">',
        '<div class="left">',
        '<img src="{{ site.url }}/assets/images/difficulty/no-classified.png" class="circle" />',
        '</div>',
        '<div class="right">',
        `<a href="{{ site.url }}/lists/exams/${exam}/noclassified">Não classificados</a>`,
        '</div>',
        '</div>'
    );
    output.push(
        '<div class="collection-item">',
        '<div class="left">',
        '<img src="{{ site.url }}/assets/images/difficulty/easy.png" class="circle" />',
        '</div>',
        '<div class="right">',
        `<a href="{{ site.url }}/lists/exams/${exam}/easy">Fáceis</a>`,
        '</div>',
        '</div>'
    );
    output.push(
        '<div class="collection-item">',
        '<div class="left">',
        '<img src="{{ site.url }}/assets/images/difficulty/medium.png" class="circle" />',
        '</div>',
        '<div class="right">',
        `<a href="{{ site.url }}/lists/exams/${exam}/medium">Médias</a>`,
        '</div>',
        '</div>'
    );
    output.push(
        '<div class="collection-item">',
        '<div class="left">',
        '<img src="{{ site.url }}/assets/images/difficulty/hard.png" class="circle" />',
        '</div>',
        '<div class="right">',
        `<a href="{{ site.url }}/lists/exams/${exam}/hard">Difíceis</a>`,
        '</div>',
        '</div>'
    );
    output.push('</div>');
    const yearsPathOutput = preparePath(outputPath, 'lists', 'exams', exam);
    const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
    fs.writeFileSync(yearsFileOutput, output.join(''));
}

export function examsList(
    outputPath: string,
    exams: string[]
) {
    const output: string[] = [
        '---\n',
        'layout: examsList\n',
        '---\n\n',
        '<div class="collection">',
    ];
    exams.forEach((exam) => output.push(`{% include exams/${exam}.html %}`));
    output.push('</div>');
    const examsPath = preparePath(outputPath, 'lists', 'exams');
    const fileExams = path.join(examsPath, 'index.html');
    fs.writeFileSync(fileExams, output.map((line) => line.trimLeft()).join(''));
}

export function yearsList(
    outputPath: string,
    yearsData: YearsPaginationOutput,
) {
    const output = [
        '---\n',
        'layout: yearsList\n',
        '---\n\n',
        '<h4>Questões por Ano</h4>',
        '<div class="collection">'
    ];
    if (yearsData.hasWithoutYears) {
        output.push(
            '<div class="collection-item">',
            '   <div class="left">',
            '       <div class="marker circle">',
            '           <span>S.A.</span>',
            '       </div>',
            '   </div>',
            '   <div class="right">',
            '       <a href="{{ site.url }}/lists/years/sa">Sem ano</a>',
            '   </div>',
            '</div>'
        );
    }
    yearsData.years.forEach((y) => {
        output.push(
            '<div class="collection-item">',
            '   <div class="left">',
            '       <div class="marker circle">',
            `           <i class="material-icons">date_range</i>`,
            '       </div>',
            '   </div>',
            '   <div class="right">',
            `       <a href="{{ site.url }}/lists/years/${y}">${y}</a>`,
        '       </div>',
            '</div>'
        );
    });
    output.push('</div>');
    const yearsPathOutput = preparePath(outputPath, 'lists', 'years');
    const yearsFileOutput = path.join(yearsPathOutput, 'index.html');
    fs.writeFileSync(yearsFileOutput, output.join(''));
}

export function difficultyList(
    outputPath: string
) {
    const output = [
        '---\n',
        'layout: yearsList\n',
        '---\n\n',
        '<h4>Questões Por dificuldade</h4>',
        '<div class="collection">',
        '   <div class="collection-item">',
        '       <div class="left">',
        '           <img src="{{ site.url }}/assets/images/difficulty/no-classified.png" class="circle" />',
        '       </div>',
        '       <div class="right">',
        `           <a href="{{ site.url }}/lists/difficulty/noclassified">Não classificados</a>`,
        '       </div>',
        '   </div>',
        '   <div class="collection-item">',
        '       <div class="left">',
        '           <img src="{{ site.url }}/assets/images/difficulty/easy.png" class="circle" />',
        '       </div>',
        '       <div class="right">',
        `           <a href="{{ site.url }}/lists/difficulty/easy">Fáceis</a>`,
        '       </div>',
        '   </div>',
        '   <div class="collection-item">',
        '       <div class="left">',
        '           <img src="{{ site.url }}/assets/images/difficulty/medium.png" class="circle" />',
        '       </div>',
        '       <div class="right">',
        `           <a href="{{ site.url }}/lists/difficulty/medium">Médias</a>`,
        '       </div>',
        '   </div>',
        '   <div class="collection-item">',
        '       <div class="left">',
        '           <img src="{{ site.url }}/assets/images/difficulty/hard.png" class="circle" />',
        '       </div>',
        '       <div class="right">',
        `           <a href="{{ site.url }}/lists/difficulty/hard">Difíceis</a>`,
        '       </div>',
        '   </div>',
        '</div>'
    ];
    const pathOutput = preparePath(outputPath, 'lists', 'difficulty');
    const fileOutput = path.join(pathOutput, 'index.html');
    fs.writeFileSync(fileOutput, output.join(''));
}
