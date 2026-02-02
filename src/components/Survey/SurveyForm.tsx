
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import axios from 'axios';
import { loginUser } from '../../store/userSlice';
import { useNavigate } from 'react-router-dom'; 
import ApplicationConfig from '../../application';

const API_URL = ApplicationConfig.API_URL;

const surveyQuestions = [
  { id: 1, label: "이름 / 나이", icon: "👤", type: "text" },
  { id: 2, label: "연락 가능한 전화번호 ", icon: "📞", type: "text",placeholder: "연락처" },
  { id: 3, label: "수업 중 불리고 싶은 호칭(프로님, 과장님등)", icon: "🎯", type: "text" ,placeholder: "프로님"},
  { id: 4, label: "개발 관련 경험이 있습니까? (있다면)", icon: "💻", type: "textarea" ,placeholder: "홈페이지 제작"},
  { id: 5, label: "사용해본 언어/툴/선호하는 툴 (체크)", icon: "🛠️", type: "checkbox", options: ["HTML", "CSS", "JavaScript", "React", "Python", "기타"] },
  { id: 6, label: "컴퓨터 활용 능력/영타수/한글타수", icon: "⌨️", type: "textarea",placeholder: "영타100/한타200" },
  { id: 7, label: "이번 부트캠프 목표(ex홈페이지개발등)", icon: "🎯", type: "textarea", placeholder: "html 채팅프로그램 채팅방운영" }  ,
  { id: 8, label: "개발 외 관심 분야(ex게임개발, 일러스트 등)", icon: "🎨", type: "text" },
  { id: 9, label: "선호하는 학습 스타일(ex실습위주, 이론중심, 원격강의  등)", icon: "📚", type: "text" },
  { id: 10, label: "질문 잘 하는 편인가요?", icon: "❓", type: "text" },
  { id: 11, label: "나를 한마디로 표현하면?", icon: "🗣️", type: "text" },
  { id: 12, label: "수업에 바라는 점 있으신가요?", icon: "💬", type: "textarea" },
  { id: 13, label: "커리큘럼은 어떻게 진행 됐으면 좋겠나요?", type: "textarea" },
];

const SurveyForm = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state: IRootState) => state.user);
  const navigate = useNavigate();
  
  const [submitType, setSubmitType] = useState<'save' | 'submit'>('submit');
  const [formData, setFormData] = useState<Record<number, any>>({});
  const [surveyId, setSurveyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // ✅ 이미 로그인된 상태면 localStorage로 덮어쓰지 않기
      if (!user.isLoggedIn && !user.id) {
        dispatch(loginUser(userData));
      }
    }
  }, [dispatch, user.id, user.isLoggedIn]);
   
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        if (!user.id) return;
        const response = await axios.get(`${API_URL}/api/my-survey?user_id=${user.id}`);
        if (response.data) {
          const survey = response.data;
          setSurveyId(survey.id);
          setFormData({
            1: survey.name,
            2: survey.phone,
            3: survey.call_name,
            4: survey.experience,
            5: survey.skills ? survey.skills.split(',') : [],
            6: survey.computer_skill,
            7: survey.goal,
            8: survey.interest,
            9: survey.study_style,
            10: survey.question_attitude,
            11: survey.one_word,
            12: survey.hope,
            13: survey.curriculum,
          });
        }
      } catch (error) {
        console.error('설문 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [user.id]);

  const handleChange = (id: number, value: any) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData[1] || formData[1].trim() === '') {
      alert('이름을 입력해주세요.');
      return;
    }
    const processedSkills = Array.isArray(formData[5]) ? formData[5].join(',') : formData[5];
    const surveyData = {
      user_id: user.id,
      name: formData[1],
      phone: formData[2],
      call_name: formData[3],
      experience: formData[4],
      skills: processedSkills,
      computer_skill: formData[6],
      goal: formData[7],
      interest: formData[8],
      study_style: formData[9],
      question_attitude: formData[10],
      one_word: formData[11],
      hope: formData[12],
      curriculum: formData[13],
      //curriculum
      is_temp: submitType === 'save' ? 0 : 1,
    };
    try {
      if (surveyId) {
        await axios.put(`${API_URL}/api/survey/${surveyId}`, surveyData);
      } else {
        await axios.post(`${API_URL}/api/survey`, surveyData);
      }
      if (submitType === 'save') {
        alert('임시 저장 완료되었습니다!');
      } else {
        alert('설문 제출 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('설문 제출 실패:', error);
      alert('설문 제출 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩중...</div>;
  if (error) return <div className="text-center text-red-500 py-20">에러 발생: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-12 text-blue-800">🚀 부트캠프 사전 설문지</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {surveyQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-8">
            <label className="block text-gray-800 font-semibold text-lg mb-4">
              <span className="mr-2">{question.icon}</span>{question.label}
            </label>
            {question.type === 'text' || question.type === 'email' ? (
              <input
                type={question.type}
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
              />
            ) : question.type === 'textarea' ? (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                value={formData[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
              />
            ) : question.type === 'checkbox' ? (
              <div className="flex flex-wrap gap-3">
                {question.options?.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData[5]?.includes(option) || false}
                      onChange={(e) => {
                        const selected = formData[5] || [];
                        if (e.target.checked) {
                          handleChange(5, [...selected, option]);
                        } else {
                          handleChange(5, selected.filter((item: string) => item !== option));
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        <div className="flex justify-center gap-6 pt-10">
          <button
            type="submit" onClick={() => setSubmitType('save')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-full transition"
          >
            💾 임시 저장
          </button>
          <button
            type="submit" onClick={() => setSubmitType('submit')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition"
          >
            🚀 제출하기
          </button>
        </div>
      </form>
    </div>
  );
};
export default SurveyForm;