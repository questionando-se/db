import path from 'path';
import fs from 'fs';
import { preparePath } from '../utils/path';

export default class LayoutsWriter {
    private version: string;

    constructor(version: string) {
        this.version = version;
    }

    private getLayoutsPath(homePath: string): string {
        return preparePath(homePath, '_layouts');
    }

    private writeFile(homePath: string, file: string, content: string): void {
        const layoutPath = this.getLayoutsPath(homePath);
        const directPath = path.join(layoutPath, file);
        fs.writeFileSync(directPath, content);
    }

    private getHTMLHead(title: string, tags: string[]): string[] {
        return [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            `    <title>${title}</title>`,
            '    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />',
            '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" />',
            `    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/styles/dashboard.css" />`,
            ...tags,
            '</head>',
            '<body>',
        ]
    }
    
    private getQuestionHTMLHead(title: string): string[] {
        return this.getHTMLHead(title, [
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous" />',
            `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/styles/question.css" />`
        ]);
    }

    private getDocumentEnding(tags: string[]): string[] {
        return [
            `<script src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/scripts/dashboard.js"></script>`,
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>',
            ...tags,
            '</body></html>',
        ];
    }

    private getQuestionDocumentEnding(): string[] {
        return this.getDocumentEnding([
            `<script src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/scripts/question.js"></script>`,
            `<script src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/scripts/userExams/common.js"></script>`,
            `<script src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/scripts/userExams/question-side.js"></script>`,
            '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js" integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4" crossorigin="anonymous"></script>',
            '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js" integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>'
        ]);
    }

    private getModal(id: string, title: string, content: string, icon: string): string[] {
        return [
            `<div id="${id}" class="modal">`,
            '   <div class="modal-content">',
            `       <h4>${title}</h4>`,
            `       <div class="center"><i class="material-icons" style="font-size: 64px;">${icon}</i></div>`,
            `       <p>${content}</p>`,
            '   </div>',
            '   <div class="modal-footer">',
            '       <a class="modal-close waves-effect waves-green btn-flat">Fechar</a>',
            '   </div>',
            '</div>'
        ];
    }

    private writeQuestionLayout(homePath: string): void {
        const output = [
            ...this.getQuestionHTMLHead('{% if page.title %} {{ page.title }} | {% endif %}Questionando - O seu banco de questões gratuito'),
            '<main>',
            '   {% include header.html %}',
            '   <div class="content">',
            '       {% include breadcrumb.html %}',
            '',
            '       <div class="container">',
            '           <div class="info">',
            '               <h4>',
            '                   {% if page.title %}',
            '                       {{ page.title }}',
            '                   {% else %}',
            '                       {{ page.exam }}',
            '                       <small>{{ page.year }}</small>',
            '                   {% endif %}',
            '               </h4>',
            '           </div>',
            '           <div class="question" data-correct="{{ page.correct }}">',
            '               {{ content }}',
            '               <div class="question-verify">',
            '                   <a id="question-verify" class="btn right dash-primary">Verificar Resposta</a>',
            '               </div>',
            '           </div>',
            '           <div class="question-content">',
            //              TODO: add here, question resolution and complementary content
            '           </div>',
            '       </div>',
            '   </div>',
            '   {% include footer.html %}',
            '</main>',
            '',
            ...this.getModal(
                'correct-modal',
                'Correto!',
                'Parabéns!! Essa é a resposta certa para a questão.',
                'check'
            ),
            ...this.getModal(
                'wrong-modal',
                'Errado!',
                'Ops!! Essa não é a resposta certa para a questão.',
                'close'
            ),
            ...this.getQuestionDocumentEnding()
        ];
        this.writeFile(
            homePath,
            'question.html',
            output.map((line) => line.trimLeft()).join('')
        );
    }

    private writeHomeLayout(homePath: string): void {
        const output = [
            ...this.getHTMLHead(
                `{{ site.subject }} | Questionando - O seu banco de questões gratuito`,
                []
            ),
            '<main>',
            '    {% include header.html %}',
            '    <div class="content">',
            '        {% include breadcrumb.html %}',
            '        <div class="container">',
            '            {{ content }}',
            '        </div>',
            '    </div>',
            '    {% include footer.html %}',
            '</main>',
            ...this.getDocumentEnding([]),
        ];
        this.writeFile(
            homePath,
            'home.html',
            output.map((line) => line.trimLeft()).join('')
        );
    }

    private writeExamsListLayout(homePath: string): void {
        const output = [
            ...this.getHTMLHead(
                `Vestibulares | Questionando - O seu banco de questões gratuito`,
                []
            ),
            '<main>',
            '    {% include header.html %}',
            '    <div class="content">',
            '        {% include breadcrumb.html %}',
            '        <div class="container">',
            '           <h4>Lista de Vestibulares</h4>',
            '           <div class="exams-list">',
            '               {{ content }}',
            '           </div>',
            '        </div>',
            '    </div>',
            '    {% include footer.html %}',
            '</main>',
            ...this.getDocumentEnding([]),
        ];
        this.writeFile(
            homePath,
            'examsList.html',
            output.map((line) => line.trimLeft()).join('')
        );
    }

    private writeYearsListLayout(homePath: string): void {
        const output = [
            ...this.getHTMLHead(
                `{{ page.exam }} | Questionando - O seu banco de questões gratuito`,
                []
            ),
            '<main>',
            '    {% include header.html %}',
            '    <div class="content">',
            '        {% include breadcrumb.html %}',
            '        <div class="container">',
            '           <h4>{{ page.exam }}</h4>',
            '           <div class="years-list">',
            '               {{ content }}',
            '           </div>',
            '        </div>',
            '    </div>',
            '    {% include footer.html %}',
            '</main>',
            ...this.getDocumentEnding([]),
        ];
        this.writeFile(
            homePath,
            'yearsList.html',
            output.map((line) => line.trimLeft()).join('')
        );
    }

    private writeQuestionListLayout(homePath: string): void {
        const output = [
            ...this.getHTMLHead(
                `Questões | Questionando - O seu banco de questões gratuito`,
                [
                    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous" />',
                    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/styles/questionList.css" />`
                ]
            ),
            '<main>',
            '    {% include header.html %}',
            '    <div class="content">',
            '        {% include breadcrumb.html %}',
            '        <div class="container">',
            '           <div class="question-list">',
            '               {{ content }}',
            '           </div>',
            '           {% include pagination.html %}',
            '        </div>',
            '    </div>',
            '    {% include footer.html %}',
            '</main>',
            ...this.getDocumentEnding([
                '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js" integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4" crossorigin="anonymous"></script>',
                '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js" integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>'
            ]),
        ];
        this.writeFile(
            homePath,
            'questionList.html',
            output.map((line) => line.trimLeft()).join('')
        );
    }

    write(homePath: string): void {
        this.writeHomeLayout(homePath);
        this.writeQuestionLayout(homePath);
        this.writeExamsListLayout(homePath);
        this.writeYearsListLayout(homePath);
        this.writeQuestionListLayout(homePath);
    }
}