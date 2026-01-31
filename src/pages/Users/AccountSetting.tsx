import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import axios from 'axios';
import { updateUser } from '@/store/userSlice';
import ApplicationConfig from '../../application';
//추가
import IconBack from '../../components/Icon/IconBack';
import { useNavigate } from 'react-router-dom';


const AccountSetting = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user);

   // var id = user.id;
    const email = user.email;
    const name = user.name;
    const [tabs, setTabs] = useState<string>('home');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);


    const [inputName, setInputName] = useState(user.name);
    const [inputJobTitle, setInputJobTitle] = useState(user.job_title || '');
    const [inputBirthday, setInputBirthday] = useState(user.birthday || '');
    const [inputLocation, setInputLocation] = useState(user.location || '');
    const [inputPhone, setInputPhone] = useState(user.phone || '');
    const [inputEmail, setInputEmail] = useState(user.email);
    const [inputTwitter, setInputTwitter] = useState(user.twitter_url || '');
    const [inputDribbble, setInputDribbble] = useState(user.dribbble_url || '');
    const [inputGithub, setInputGithub] = useState(user.github_url || '');
    const [updatedProfileImagePath, setUpdatedProfileImagePath] = useState(user.profileImage || '');

    const API_URL = ApplicationConfig.API_URL;	
    const [formData, setFormData] = useState({
        id:user.id,
        nameId:'',
        name: '',
        job_title: '',
        birthday: '',
        location: '',
        phone: '',
        email: '',
        twitter_url: '',
        dribbble_url: '',
        github_url: '',
    });

    useEffect(() => {
        if (user.id) {
            fetchUserDetails();
        }
    }, [user.id]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/${user.id}`);
            console.log('유저 상세 가져오기 성공', response.data);
            setFormData(prev => ({ ...prev, ...response.data.user })); // ✅ .user 붙여야 함
        } catch (error) {
            console.error('유저 상세 가져오기 실패', error);
        }
    };

    const toggleTabs = (name: string) => setTabs(name);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        const form = new FormData();

        form.append('profile', selectedImage);
        // 🔥 userId -> nameId 추가
        form.append('nameId', String(user.nameId));  // user.id를 문자로 변환해서 같이 보내!

        try {
            const res = await axios.post(`${API_URL}/api/upload-profile`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const filePath = res.data.filePath;

            //alert(filePath);
          
            // ✅ 여기!! Redux에 바로 저장
        dispatch(updateUser({ profileImage: filePath }));

        alert('프로필 사진 업데이트 완료!');
        } catch (error) {
            console.error('프로필 업로드 실패', error);
            alert('프로필 업로드 실패');
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

   // 🔥 저장 버튼 클릭
const handleSave = async () => {
    try {
     
    console.log("formData",formData);
      await axios.put(`${API_URL}/api/user`, {...formData
        //id: user.id,
      });  
      // Redux에도 업데이트
      dispatch(updateUser({ profileImage: updatedProfileImagePath }));
  
      alert('회원정보 저장 완료!');
    } catch (error) {
      console.error('회원정보 저장 실패:', error);
      alert('회원정보 저장 중 오류 발생');
    }
  };

    return (
        <div className="p-6">
         <button
                      type="button"
                      className="xl:hidden hover:text-primary flex-none"
                      onClick={() => navigate('/apps/chat')}
                    >
                      <IconBack />
                    </button>
            <div className="flex flex-col items-center">
                <img
                    src={previewImage || `${API_URL}${user.profileImage}` || '/assets/images/profile-34.jpeg'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mb-4"
                />
                {!selectedImage ? (
                    <input type="file" accept="image/*" onChange={handleImageChange} className="btn" />
                ) : (
                    <button onClick={handleUpload} className="btn btn-primary">업로드</button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['비밀번호','이름', 'job_title', 'birthday', 'location', 'phone', 'email', 'twitter_url', 'dribbble_url', 'github_url'].map((field) => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                            {field.replace('_', ' ').toUpperCase()}
                        </label>
                        <input
                            id={field}
                            value={(formData as any)[field] || ''}
                            onChange={handleFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            readOnly={field === 'email'} // 🔥 추가
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button onClick={handleSave} className="btn btn-primary w-40">
                    저장하기
                </button>
            </div>
        </div>
    );
};

export default AccountSetting;
