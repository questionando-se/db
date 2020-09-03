import { QuestionFile } from "../core/question";

interface ExamData {
    text: string;
    longText: string;
    image: string;
    writeQuestionTitle: (data: QuestionFile) => string;
}

function commmonNotebookTitle(data: QuestionFile, noteBookName: string): string {
    let complement = '';
    if (data.number) {
        complement = ` - Questão ${data.number}`;
        if (data.notebook) {
            complement = `${complement} ${noteBookName} ${data.notebook}`;
        }
    }
    return `${data.exam} ${data.year}${complement}`;
}

const examsData: { [key: string]: ExamData } = {
    ENEM: {
        text: 'Enem',
        longText: 'Exame Nacional do Ensino Médio',
        image: 'logos/enem.png',
        writeQuestionTitle: (data: QuestionFile) => commmonNotebookTitle(data, 'Caderno'),
    },
    FUVEST: {
        text: 'Fuvest',
        longText: 'Fundação Universitária para o Vestibular',
        image: 'logos/fuvest.png',
        writeQuestionTitle: (data: QuestionFile) => commmonNotebookTitle(data, 'Prova'),
    }
};

export default examsData;
