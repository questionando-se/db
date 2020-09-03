import path from 'path';
import fs from 'fs';
import { preparePath } from '../utils/path';

export default class IncludesWriter {
    constructor() {
    }

    private getIncludePath(homePath: string): string {
        return preparePath(homePath, '_includes');
    }

    private writeFile(homePath: string, file: string, content: string): void {
        const includePath = this.getIncludePath(homePath);
        const directPath = path.join(includePath, file);
        fs.writeFileSync(directPath, content);
    }

    private writeHeader(homePath: string): void {
        const output = [
            '<header>',
            '    <nav>',
            '        <div class="nav-wrapper">',
            '            <ul class="hide-on-large-only">',
            '                <li>',
            '                    <a class="sidenav-trigger" href="#" data-target="mobile-menu">',
            '                        <i class="material-icons">menu</i>',
            '                    </a>',
            '                </li>',
            '            </ul>',
            '        </div>',
            '    </nav>',
            '    <ul id="mobile-menu" class="sidenav sidenav-fixed">',
            '        <li class="logo">',
            '            <a id="logo-container" class="brand-logo" href="https://questionando-se.github.io">',
            '                <img src="https://questionando-se.github.io/assets/images/logo-black.svg" />',
            '            </a>',
            '        </li>',
            '        <li><a href="https://questionando-se.github.io"><i class="material-icons">home</i>Início</a></li>',
            '        <li><a href="{{ site.url }}">',
            '            {% if site.iconType == "material" %}',
            '               <i class="material-icons">{{ site.icon }}</i>',
            '            {% endif %}',
            '            {{ site.subject }}',
            '        </a></li>',
            '        <li><div class="divider"></div></li>',
            '        <li><a class="subheader">Filtrar</a></li>',
            '        <li><a href="{{ site.url }}/lists/exams"><i class="material-icons">book</i>Por Vestibulares</a></li>',
            '        <li><a href="{{ site.url }}/lists/years"><i class="material-icons">date_range</i>Por Ano</a></li>',
            '        <li><a href="{{ site.url }}/lists/difficulty"><i class="material-icons">filter_list</i>Por Dificuldade</a></li>',
            '    </ul>',
            '</header>',
            '<div class="header-colored"></div>',
        ];
        this.writeFile(homePath, 'header.html', output.map((line) => line.trimLeft()).join(''));
    }

    private writePagination(homePath: string): void {
        const output = [
            '{% if page.pagesCount != 1 %}',
            '    <div class="pagination-container">',
            '    <ul class="pagination">',
            '        {% if page.currentPage == 1 %}',
            '            <li class="disabled"><a><i class="material-icons">chevron_left</i></a></li>',
            '        {% else %}',
            '            <li class="waves-effect">',
            '                {% assign backNumber = page.currentPage | minus: 1 %}',
            '                {% assign file = "index" %}',
            '                {% if backNumber != 1 %}',
            '                    {% assign file = "p" | append: backNumber %}',
            '                {% endif %}',
            '                <a href="{{ site.url }}/{{ page.relativePath }}/{{ file }}.html">',
            '                    <i class="material-icons">chevron_left</i>',
            '                </a>',
            '            </li>',
            '        {% endif %}',
            '        ',
            '        {% for i in (1..page.pagesCount) %}',
            '            {% if i == page.currentPage %}',
            '                <li class="active"><a>{{ i }}</a></li>',
            '            {% else %}',
            '                {% assign file = "index" %}',
            '                {% if i != 1 %}',
            '                    {% assign file = "p" | append: i %}',
            '                {% endif %}',
            '                <li class="waves-effect">',
            '                    <a href="{{ site.url }}/{{ page.relativePath }}/{{ file }}.html">',
            '                        {{ i }}',
            '                    </a>',
            '                </li>',
            '            {% endif %}',
            '        {% endfor %}',
            '            ',
            '        {% if page.currentPage == page.pagesCount %}',
            '            <li class="disabled"><a><i class="material-icons">chevron_right</i></a></li>',
            '        {% else %}',
            '            <li class="waves-effect">',
            '                {% assign nextNumber = page.currentPage | plus: 1 %}',
            '                {% assign file = "index" %}',
            '                {% if nextNumber != 1 %}',
            '                    {% assign file = "p" | append: nextNumber %}',
            '                {% endif %}',
            '                <a href="{{ site.url }}/{{ page.relativePath }}/{{ file }}.html">',
            '                    <i class="material-icons">chevron_right</i>',
            '                </a>',
            '            </li>',
            '        {% endif %}',
            '    </ul>',
            '    </div>',
            '{% endif %}',
        ];
        this.writeFile(homePath, 'pagination.html', output.map((line) => line.trimLeft()).join(''));
    }

    private writeFooter(homePath: string): void {
        const output = [
            '<footer class="page-footer">',
            '    <div class="container">',
            '        <div class="row">',
            '            <div class="col l6 s12">',
            '                <h5 class="white-text">Questionando</h5>',
            '                <p class="grey-text text-lighten-4">Questões de vestibulares de forma simples e gratuíta.</p>',
            '            </div>',
            '            <div class="col l4 offset-l2 s12">',
            '                <h5 class="white-text">Links</h5>',
            '                <ul>',
            '                    <li><a class="grey-text text-lighten-3" href="{{ site.url }}">Início</a></li>',
            '                    <li><a class="grey-text text-lighten-3" href="{{ site.url }}/conheca.html">Conheça</a></li>',
            '                    <li><a class="grey-text text-lighten-3" href="{{ site.url }}/contato.html">Contato</a></li>',
            '                    <li><a class="grey-text text-lighten-3" href="{{ site.url }}/materias.html">Matérias</a></li>',
            '                </ul>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="footer-copyright">',
            '        <div class="container">',
            '            <span>Questionando © 2020 - Layout e implementação por <a class="grey-text text-lighten-4" href="https://eduardojm.github.io/" target="_blank">Eduardo Oliveira</a></span>',
            '        </div>',
            '    </div>',
            '</footer>',
        ];
        this.writeFile(homePath, 'footer.html', output.map((line) => line.trimLeft()).join(''));
    }

    private writeBreadcrumb(homePath: string): void {
        const getPageDifficulty = (url: string): string[] => {
            return [
            '{% if page.difficulty %}',
            '   {% assign difficulty = "Sem dificuldade classificada" %}',
            '   {% if page.difficulty == "easy" %}',
            '       {% assign difficulty = "Fáceis" %}',
            '   {% elsif page.difficulty == "medium" %}',
            '       {% assign difficulty = "Médias" %}',
            '   {% elsif page.difficulty == "hard" %}',
            '       {% assign difficulty = "Difíceis" %}',
            '   {% endif %}',
            `   <a href="{{ site.url }}${url}" class="breadcrumb">{{ difficulty }}</a>`,
            '{% endif %}',
            ];
        };
        const output = [
            '<nav class="breadcrumb-nav transparent z-depth-0">',
            '    <div class="nav-wrapper">',
            '        <div class="col s12">',
            '            <a href="{{ site.url }}" class="breadcrumb">{{ site.subject }}</a>',
            '            {% if page.exam %}',
            '                <a href="{{ site.url }}/lists/exams/{{ page.exam }}" class="breadcrumb">{{ page.exam }}</a>',
            '                {% if page.year %}',
            '                    {% assign link = "noclassified" %}',
            '                    {% assign text = "Sem data" %}',
            '                    {% if page.year != "na" %}',
            '                        {% assign link = page.year %}',
            '                        {% assign text = page.year %}',
            '                    {% endif %}',
            '                    <a href="{{ site.url }}/lists/exams/{{ page.exam }}/{{ link }}" class="breadcrumb">{{ text }}</a>',
            '                {% endif %}',
            ...getPageDifficulty('/lists/exams/{{ page.exam }}/{{ page.difficulty }}'),
            '                {% if page.tag and page.tagText %}',
            '                    {% assign link = "/lists/exams/" | append: page.exam | append: "/tags/" | append: page.tag %}',
            '                    {% if page.year %}',
            '                        {% assign link = "/lists/exams/" | append: page.exam | append: "/" | append: page.year | append: "/tags/" | append: page.tag %}',
            '                    {% endif %}',
            '                    <a href="{{ site.url }}/{{ link }}" class="breadcrumb">{{ page.tagText }}</a>',
            '                {% endif %}',
            '            {% else %}',
            '',
            ...getPageDifficulty('/lists/difficulty/{{ page.difficulty }}'),
            '                {% if page.tag and page.tagText %}',
            '                    {% assign link = "/lists/tags/" | append: page.tag %}',
            '                    {% if page.year %}',
            '                        {% assign link = "/lists/years/" | append: page.year | append: "/tags/" | append: page.tag %}',
            '                    {% endif %}',
            '                    <a href="{{ site.url }}/{{ link }}" class="breadcrumb">{{ page.tagText }}</a>',
            '                {% endif %}',
            '',
            '            {% endif %}',
            '        </div>',
            '    </div>',
            '</nav>',
        ];
        this.writeFile(homePath, 'breadcrumb.html', output.map((line) => line.trimLeft()).join(''));
    }

    write(homePath: string) {
        this.writeHeader(homePath);
        this.writePagination(homePath);
        this.writeFooter(homePath);
        this.writeBreadcrumb(homePath);
    }
}