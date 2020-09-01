interface ExamData {
    text: string;
    longText: string;
    image: string;
}

const examsData: { [key: string]: ExamData } = {
    ENEM: {
        text: 'Enem',
        longText: 'Exame Nacional do Ensino Médio',
        image: 'data/logo/enem.png'
    },
    FUVEST: {
        text: 'Fuvest',
        longText: 'Fundação Universitária para o Vestibular',
        image: 'data/logo/fuvest.png'
    }
};

export default examsData;
