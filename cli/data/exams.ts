interface ExamData {
    text: string;
    longText: string;
    image: string;
}

const examsData: { [key: string]: ExamData } = {
    ENEM: {
        text: 'Enem',
        longText: 'Exame Nacional do Ensino Médio',
        image: 'logos/enem.png'
    },
    FUVEST: {
        text: 'Fuvest',
        longText: 'Fundação Universitária para o Vestibular',
        image: 'logos/fuvest.png'
    }
};

export default examsData;
