import path from 'path';
import fs from 'fs';
import { QuestionFileInformation } from '../core/question';

export default class HomePageWriter {
    private hasEnemExam: boolean;

    private questions: number;

    private resolutionVideos: number;

    private complementayVideos: number;

    private version: string;

    constructor(version: string, items: QuestionFileInformation[]) {
        this.hasEnemExam = false;
        this.questions = 0;
        this.resolutionVideos = 0;
        this.complementayVideos = 0;
        this.version = version;
        this.parseData(items);
    }

    private parseData(items: QuestionFileInformation[]) {
        this.questions = items.length;
        items.forEach((item) => {
            if (item.data.exam === 'ENEM') {
                this.hasEnemExam = true;
            }
            if (item.data.resolutions !== undefined) {
                if (item.data.resolutions.length > 0) {
                    this.resolutionVideos += 1;
                }
            }
            if (item.data.complementary !== undefined) {
                if (item.data.complementary.length > 0) {
                    this.complementayVideos += 1;
                }
            }
        });
    }

    private getEnemCard(): string {
        if (!this.hasEnemExam) {
            return '';
        }
        return [
            '<div class="row">',
            '    <div class="col s12">',
            '        <div class="card-panel dash-primary">',
            '            <div class="row">',
            '                <div class="col s12 m10">',
            '                    <h5 class="white-text">Exame Nacional do Ensino Médio</h5>',
            '                    <span class="white-text">',
            '                        Questões de anos anteriores do Exame Nacional do Ensino Médio (<b>Enem</b>) para você treinar e se dar bem na próxima aplicação.',
            '                    </span>',
            '                    <div class="card-panel-actions">',
            '                        <a href="{{ site.url }}/lists/exams/ENEM" class="white-text">',
            '                            Me mostre <i class="material-icons">arrow_forward</i>',
            '                        </a>',
            '                    </div>',
            '                </div>',
            '                <div class="col s12 m2 hide-on-small-only">',
            `                    <img class="circle responsive-img white" src="https://cdn.jsdelivr.net/gh/questionando-se/dashboard@${this.version}/logos/enem.png" />`,
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>',
        ].map((line) => line.trimLeft()).join('');
    }

    private getNumberCards(): string {
        const output = [
            '<h4>Alguns Números</h4>',
            '<div class="row">',
        ];
        if (this.questions > 0) {
            output.push(
                '<div class="col s12 m4">',
                '   <div class="card-panel green darken-2">',
                `       <h1 class="white-text">${this.questions}</h1>`,
                '       <h5 class="white-text">Questões</h5>',
                '   </div>',
                '</div>'
            );
        }
        if (this.resolutionVideos > 0) {
            output.push(
                '<div class="col s12 m4">',
                '   <div class="card-panel light-blue darken-2">',
                `       <h1 class="white-text">${this.resolutionVideos}</h1>`,
                '       <h5 class="white-text">Vídeos de Resolução</h5>',
                '   </div>',
                '</div>'
            );
        }
        if (this.complementayVideos > 0) {
            output.push(
                '<div class="col s12 m4">',
                '   <div class="card-panel purple darken-2">',
                `       <h1 class="white-text">${this.complementayVideos}</h1>`,
                '       <h5 class="white-text">Vídeos Complementares</h5>',
                '   </div>',
                '</div>'
            );
        }
        output.push(
            '</div>',
        );
        return output.map((line) => line.trimLeft()).join('');
    }

    private buildPage(): string {
        const output = [
            '---\n',
            'layout: home\n',
            '---\n\n',
            '<div id="home-dash">',
            this.getEnemCard(),
            this.getNumberCards(),
            '</div>',

        ];
        // no need to trim left, for now.
        return output.join('');
    }

    write(homePath: string): void {
        const indexFile = path.join(homePath, 'index.html');
        fs.writeFileSync(indexFile, this.buildPage());
    }
}