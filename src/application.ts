// src/application.ts

const ApplicationConfig = {
    // API 서버 주소
    //API_URL: import.meta.env.VITE_API_URL || 'https://bootcampbackend-production.up.railway.app',
  
    // 백엔드 기본 URL (로컬 개발용)
    API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
    // 로컬 DB 접속용 URL
    DB_URL: import.meta.env.VITE_DB_URL2 || 'mysql://root:password@localhost:3306/mydb',
  };
  
  export default ApplicationConfig;
  