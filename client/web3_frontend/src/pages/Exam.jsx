import React,{useState,useEffect} from 'react'
import { unixfs } from '@helia/unixfs'
import { json } from '@helia/json'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'
import questions from '../TestPaper/questions.json'
import { AES, enc } from 'crypto-js';

const Exam = ({helia}) => {

    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(false);

    const SECRET_KEY = '6c187bb65c1a4dbf9b3fc8b576a1c2dd';
    const getExam = async () => {
        // Prevent multiple session establishments
        if (loading) return;
        setLoading(true);
        try {
            // const helia = await createHelia();
            const j = json(helia);
           
            const myImmutableAddress = 'bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea';
            const answerAddress = 'bagaaiera4hwaab6rrrng5b6gcrd64adziezyupxtcfncfs2jorn44doclmiq'
            const cid = CID.parse(myImmutableAddress);
    
            let text = await j.get(cid);
            console.log(text)
            const decryptedTest = decryptData(text);
            console.log(decryptedTest);
            
            setExam(decryptedTest);
        } catch (error) {
            console.error('Error getting exam:', error);
        } finally {
            setLoading(false);
        }
    };
    // Function to decrypt the JSON data
    const decryptData = (encryptedData) => {
        const decryptedData = AES.decrypt(encryptedData, SECRET_KEY).toString(enc.Utf8);
        return JSON.parse(decryptedData);
    };
        
  return (
    <>
        <button onClick={getExam}> GET EXAM</button>
        {exam && <div>
            {exam.questions.questions.map((question, index) => (
                <div key={index}>
                    <h3>{question.question}</h3>
                    <ul>
                        {question.options.map((option, optionIndex) => (
                            <li key={optionIndex}>{option}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>}
    </>
  )
}

export default Exam
