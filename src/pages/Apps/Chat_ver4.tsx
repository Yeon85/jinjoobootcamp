import Dropdown from '../../components/Dropdown';
import { io, Socket } from 'socket.io-client';

import { IRootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { setPageTitle } from '../../store/themeConfigSlice';

import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconBack from '../../components/Icon/IconBack';
import IconSettings from '../../components/Icon/IconSettings';
import IconHelpCircle from '../../components/Icon/IconHelpCircle';
import IconLogin from '../../components/Icon/IconLogin';
import IconSearch from '../../components/Icon/IconSearch';
import IconMessagesDot from '../../components/Icon/IconMessagesDot';
import IconPhone from '../../components/Icon/IconPhone';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconUser from '../../components/Icon/IconUser';
import IconBell from '../../components/Icon/IconBell';
import IconMessage from '../../components/Icon/IconMessage';
import IconPhoneCall from '../../components/Icon/IconPhoneCall';
import IconVideo from '../../components/Icon/IconVideo';
import IconCopy from '../../components/Icon/IconCopy';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconShare from '../../components/Icon/IconShare';
import IconMoodSmile from '../../components/Icon/IconMoodSmile';
import IconSend from '../../components/Icon/IconSend';
import IconMicrophoneOff from '../../components/Icon/IconMicrophoneOff';
import IconDownload from '../../components/Icon/IconDownload';
import IconCamera from '../../components/Icon/IconCamera';
import IconX from '../../components/Icon/IconX';

import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

import ApplicationConfig from '../../application';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Tab = 'users' | 'chats' | 'contacts' | 'calls' | 'noti';

type Message = {
  contactId: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  time: string;
};

type Contact = {
  contactId: number;
  userId: number;
  name: string;
  path: string;
  active: number | boolean;
  time: string;
  preview: string;
  messages: Message[];
};

const Chat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const API_URL = ApplicationConfig.API_URL;
  const user = useSelector((state: IRootState) => state.user);
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

  const socketRef = useRef<Socket | null>(null);

  const [tab, setTab] = useState<Tab>('chats');
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [filteredItems, setFilteredItems] = useState<Contact[]>([]);
  const [searchUser, setSearchUser] = useState('');

  const [isShowUserChat, setIsShowUserChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);

  const [textMessage, setTextMessage] = useState('');

  /* ---------------- 연락처 추가 모달 ---------------- */
  const [addContactModal, setAddContactModal] = useState(false);
  const [params, setParams] = useState({ targetUserId: '', name: '' });

  const changeValue = (e: any) => {
    const { id, value } = e.target;
    setParams((p) => ({ ...p, [id]: value }));
  };

  const showMessage = (msg = '', type: any = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      icon: type,
      title: msg,
    });
  };

  const createContact = async () => {
    try {
      await axios.post(`${API_URL}/api/contacts`, {
        myUserId: user.id,
        targetUserId: Number(params.targetUserId),
        name: params.name,
        path: 'user-profile.png',
      });
      showMessage('연락처가 추가되었습니다.');
      setAddContactModal(false);
      setParams({ targetUserId: '', name: '' });
      fetchRooms();
    } catch (error: any) {
        console.error(error);

    // 백엔드에서 내려준 메시지 우선 사용
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
       error?.data||
      '연락처 추가 실패';

    showMessage(message, 'error');
    }
  };






  /* ---------------- 공통 함수 ---------------- */
  const resolveImg = (p?: string) => {
    if (!p) return `/assets/images/profile-35.png`;
    if (p.startsWith('/uploads')) return `${API_URL}${p}`;
    return `/assets/images/${p}`;
  };

  const fetchRooms = async () => {
    const res = await axios.get(`${API_URL}/api/contacts/${user.id}`);
    setContactList(res.data.contacts || []);
    setFilteredItems(res.data.contacts || []);
  };

  const selectUser = (person: Contact) => {
    setSelectedUser(person);
    setIsShowUserChat(true);
    setTab('chats');
    socketRef.current?.emit('joinRoom', { contactId: person.contactId });
  };

  /* ---------------- lifecycle ---------------- */
  useEffect(() => {
    if (!user.id) {
      navigate('/auth/boxed-signin');
      return;
    }
    dispatch(setPageTitle('Chat'));
    socketRef.current = io(API_URL, { withCredentials: true });
    fetchRooms();
  }, [user.id]);

  useEffect(() => {
    setFilteredItems(
      contactList.filter((c) => (c.name || '').toLowerCase().includes(searchUser.toLowerCase()))
    );
  }, [searchUser, contactList]);

  /* ======================= RENDER ======================= */
  return (
    <div className="flex sm:h-[calc(100vh_-_150px)] h-full">

      {/* ================= LEFT ================= */}
      <div className="panel p-4 max-w-xs w-full">

        {/* header */}
        <div className="flex items-center gap-3 mb-3">
          <img src={resolveImg(user.profileImage)} className="w-16 h-16 rounded-full" />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-white-dark">{user.email}</p>
          </div>
        </div>

        {/* search */}
        <div className="relative mb-3">
          <input
            className="form-input pr-9"
            placeholder="검색"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <IconSearch className="absolute right-2 top-2.5" />
        </div>

        {/* tabs */}
        <div className="flex justify-between text-xs mb-3">
          <button onClick={() => setTab('users')}><IconUser />사용자</button>
          <button onClick={() => setTab('chats')} className={tab === 'chats' ? 'text-primary' : ''}><IconMessagesDot />채팅</button>
          <button onClick={() => setTab('calls')}><IconPhone />전화</button>
          <button onClick={() => setTab('contacts')} className={tab === 'contacts' ? 'text-primary' : ''}><IconUserPlus />연락처</button>
          <button onClick={() => setTab('noti')}><IconBell />공지</button>
        </div>

        {/* ================= LIST (빨간 영역) ================= */}
        <PerfectScrollbar className="h-[calc(100vh_-_360px)] space-y-2">

          {/* CONTACTS 탭 */}
          {tab === 'contacts' && (
            <>
              <button className="btn btn-primary w-full mb-2" onClick={() => setAddContactModal(true)}>
                <IconUserPlus className="mr-2" /> 아이디 추가
              </button>

              {filteredItems.map((c) => (
                <div key={c.contactId} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
                  <div className="flex items-center gap-3">
                    <img src={resolveImg(c.path)} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-white-dark">ID: {c.userId}</p>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => selectUser(c)}>Chat</button>
                </div>
              ))}
            </>
          )}

          {/* CHATS 탭 */}
          {tab === 'chats' && filteredItems.map((c) => (
            <button
              key={c.contactId}
              onClick={() => selectUser(c)}
              className="w-full flex justify-between p-2 hover:bg-gray-100 rounded-md"
            >
              <div className="flex gap-3">
                <img src={resolveImg(c.path)} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-white-dark truncate">{c.preview}</p>
                </div>
              </div>
              <span className="text-xs">{c.time}</span>
            </button>
          ))}
        </PerfectScrollbar>
      </div>

      {/* ================= RIGHT (채팅) ================= */}
      <div className="panel flex-1 hidden xl:block">
        {!isShowUserChat ? (
          <div className="h-full flex items-center justify-center">
            <IconMessage className="mr-2" /> 채팅을 선택하세요
          </div>
        ) : (
          <div className="p-4">채팅 화면 영역 (기존 로직 그대로 연결)</div>
        )}
      </div>

      {/* ================= 연락처 추가 모달 ================= */}
      <Transition appear show={addContactModal} as={Fragment}>
        <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)}>
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="panel w-[400px] p-4">
              <button className="absolute right-4 top-4" onClick={() => setAddContactModal(false)}><IconX /></button>
              <h3 className="mb-4 font-semibold">연락처 추가</h3>
              <input id="targetUserId" className="form-input mb-2" placeholder="User ID" value={params.targetUserId} onChange={changeValue} />
              <input id="name" className="form-input mb-4" placeholder="이름" value={params.name} onChange={changeValue} />
              <button className="btn btn-primary w-full" onClick={createContact}>추가</button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Chat;
