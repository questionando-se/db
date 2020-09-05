import { QuestionFile } from "../core/question";

interface ExamData {
    text: string;
    longText: string;
    image: string;
    writeQuestionTitle: (data: QuestionFile) => string;
}

function commmonNotebookTitle(examText: string, data: QuestionFile, noteBookName: string): string {
    let complement = '';
    if (data.number) {
        complement = ` - Questão ${data.number}`;
        if (data.notebook) {
            complement = `${complement} ${noteBookName} ${data.notebook}`;
        }
    }
    return `${examText} ${data.year}${complement}`;
}

const examsData: { [key: string]: ExamData } = {
    ENEM: {
        text: 'Enem',
        longText: 'Exame Nacional do Ensino Médio',
        image: 'logos/enem.png',
        writeQuestionTitle: (data: QuestionFile) => commmonNotebookTitle('Enem', data, 'Caderno'),
    },
    ENEM_PPL: {
        text: 'Enem PPL',
        longText: 'Exame Nacional do Ensino Médio para Pessoas Privadas de Liberdade e Jovens sob Medida Socioeducativa',
        image: 'logos/enem.png',
        writeQuestionTitle: (data: QuestionFile) => commmonNotebookTitle('Enem PPL', data, 'Caderno'),
    },
    FUVEST: {
        text: 'Fuvest',
        longText: 'Fundação Universitária para o Vestibular',
        image: 'logos/fuvest.png',
        writeQuestionTitle: (data: QuestionFile) => commmonNotebookTitle('Fuvest', data, 'Prova'),
    }
};

export default examsData;
