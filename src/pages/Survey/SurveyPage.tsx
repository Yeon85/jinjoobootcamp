import SurveyForm from '@/components/Survey/SurveyForm'; // 경로는 프로젝트에 맞게 조정할 것
import { Helmet } from 'react-helmet-async'; // (선택) SEO를 위해 문서 타이틀 설정하려면

const SurveyPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            {/* (선택) 문서 제목 설정 */}
            <Helmet>
                <title>부트캠프 사전 설문지</title>
            </Helmet>

            <div className="container mx-auto px-4">
                {/* 설문 폼 컴포넌트 렌더링 */}
                <SurveyForm />
            </div>
        </div>
    );
};

export default SurveyPage;
