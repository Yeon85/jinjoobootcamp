// src/application.ts

    // API 서버 주소 : 운영서버 배포시 수정
    //API_URL: import.meta.env.VITE_API_BASE_URL || 'https://bootcampbackend-production.up.railway.app',
  
    // 백엔드 기본 URL (로컬 개발용)
    //API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
    // 로컬 DB 접속용 URL
    //DB_URL: import.meta.env.VITE_DB_URL2 || 'mysql://root:password@localhost:3306/mydb',

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

const ApplicationConfig = {
  API_URL: isLocal
    ? 'http://localhost:5000'
    : 'https://bootcampbackend-production.up.railway.app',
};

export default ApplicationConfig;


