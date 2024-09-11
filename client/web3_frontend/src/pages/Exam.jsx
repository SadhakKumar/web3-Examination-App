import React,{useState,useEffect} from 'react'
import { unixfs } from '@helia/unixfs'
import { json } from '@helia/json'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'
import questions from '../TestPaper/questions.json'

const Exam = () => {

    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(false);

    
    const getExam = async () => {
        // Prevent multiple session establishments
        if (loading) return;
        setLoading(true);
        try {
            const helia = await createHelia();
            const j = json(helia);
    
            const myImmutableAddress = await j.add({ questions });
            console.log('Added file to IPFS:', myImmutableAddress.toString());
    
            let text = await j.get(myImmutableAddress);
            console.log(text);
            helia.stop()
            setExam(text);
        } catch (error) {
            console.error('Error getting exam:', error);
        } finally {
            setLoading(false);
        }
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