import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store'; // store 경로 맞게 수정



import axios from 'axios';

const surveyQuestions = [
    { id: 1, label: "이름 / 닉네임", type: "text" },
    { id: 2, label: "연락 가능한 전화번호/email", type: "text" },
    { id: 3, label: "수업 중 불리고 싶은 이름(별명)", type: "text" },
    { id: 4, label: "개발 관련 경험 (있다면)", type: "textarea" },
    { id: 5, label: "사용해본 언어/툴 (체크)", type: "checkbox", options: ["HTML", "CSS", "JavaScript", "React", "Python", "기타"] },
    { id: 6, label: "컴퓨터 활용 능력", type: "textarea" },
    { id: 7, label: "이번 부트캠프 목표", type: "textarea" },
    { id: 8, label: "개발 외 관심 분야", type: "text" },
    { id: 9, label: "선호하는 학습 스타일", type: "text" },
    { id: 10, label: "질문 잘 하는 편인가요?", type: "text" },
    { id: 11, label: "나를 한마디로 표현하면?", type: "text" },
    { id: 12, label: "수업에 바라는 점", type: "textarea" },
];

const SurveyForm = () => {
    const user = useSelector((state: IRootState) => state.user); // ✅ 최상단에서 user 꺼냄

    const [formData, setFormData] = useState<any>({});

    const handleChange = (id: number, value: any) => {
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
         
       // 🔥 여기서 명확하게 변환
    const processedSkills = Array.isArray(formData[5]) ? formData[5].join(',') : formData[5];

        console.log('서버로보내는데이터',formData);
        console.log('formData[1]',formData[1]);
       // 1. 숫자 키를 의미 있는 키로 변환
        const surveyData = {
            user_id: user.id,
            name: formData[1],
            phone: formData[2],
            call_name: formData[3],
            experience: formData[4],
            skills: '',
            computer_skill: formData[6],
            goal: formData[7],
            interest: formData[8],
            study_style: formData[9],
            question_attitude: formData[10],
            one_word: formData[11],
            hope: formData[12],
        };
        console.log('서버로보내는데이터',surveyData);
        try {
            const response = await axios.post('http://localhost:5000/api/survey', surveyData);
            //console.log('서버 응답:', response.data);
            alert('설문 제출이 완료되었습니다!');
        } catch (error) {
            console.error('설문 제출 실패:', error);
            alert('설문 제출 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">부트캠프 사전 설문지</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {surveyQuestions.map((question) => (
                    <div key={question.id} className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 transition">
                        <label className="block text-gray-700 font-medium mb-2">{question.label}</label>

                        {question.type === 'text' || question.type === 'email' ? (
                            <input
                                type={question.type}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => handleChange(question.id, e.target.value)}
                            />
                        ) : question.type === 'textarea' ? (
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                onChange={(e) => handleChange(question.id, e.target.value)}
                            ></textarea>
                        ) : question.type === 'checkbox' ? (
                            <div className="flex flex-wrap gap-2">
                                {question.options?.map((option) => (
                                    <label key={option} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            onChange={(e) => {
                                                const selected = formData[question.id] || [];
                                                if (e.target.checked) {
                                                    handleChange(question.id, [...selected, option]);
                                                } else {
                                                    handleChange(question.id, selected.filter((item: string) => item !== option));
                                                }
                                            }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ))}

                <div className="text-center">
                    <button
                        type="submit"
                        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        제출하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SurveyForm;
