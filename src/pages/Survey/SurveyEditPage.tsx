import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SurveyEditPage = () => {
  const { id } = useParams(); // URL의 :id 값 가져오기
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({});

  // 서버에서 기존 설문 데이터 불러오기
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/survey/${id}`);
        setFormData(response.data); // 받아온 데이터로 폼 채움
      } catch (error) {
        console.error('설문 조회 실패:', error);
      }
    };

    fetchSurvey();
  }, [id]);

  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 수정 완료 버튼 눌렀을 때
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/survey/${id}`, formData);
      alert('수정 완료!');
      navigate('/survey'); // 수정 완료 후 리스트로 이동
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">설문 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-bold">이름 / 닉네임</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full border rounded p-3"
          />
        </div>

        <div>
          <label className="block mb-1 font-bold">전화번호</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full border rounded p-3"
          />
        </div>

        <div>
          <label className="block mb-1 font-bold">별명</label>
          <input
            type="text"
            name="call_name"
            value={formData.call_name || ''}
            onChange={handleChange}
            className="w-full border rounded p-3"
          />
        </div>

        {/* 필요에 따라 추가 폼 작성 가능 */}
        
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600"
          >
            수정 완료
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyEditPage;
