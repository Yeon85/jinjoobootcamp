import Dropdown from '../../components/Dropdown';
import { io, Socket } from 'socket.io-client';

import { IRootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { Fragment, useEffect, useRef, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { setPageTitle } from '../../store/themeConfigSlice';

import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconBack from '../../components/Icon/IconBack';
import IconSettings from '../../components/Icon/IconSettings';
import IconHelpCircle from '../../components/Icon/IconHelpCircle';
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

import ApplicationConfig from '../../application';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Dialog, Transition } from '@headlessui/react';

//추가
import { logoutUser } from '@/store/userSlice';
import IconLogout from '../../components/Icon/IconLogout';

type Tab = 'users' | 'chats' | 'contacts' | 'calls' | 'noti';

type Message = {
  contactId: number;
  fromUserId: string; // ✅ 서버가 nameId 또는 id(숫자)를 문자열로 줄 수도 있음
  toUserId: string;
  text: string;
  time: string;
};

type Contact = {
  contactId: number;
  userId: string; // ✅ 상대 아이디(nameId)
  name: string;
  nameId?: string; // 서버가 주면 쓰고 아니면 무시
  path?: string;
  active: number | boolean;
  time: string;
  preview?: string;
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

  const [isShowChatMenu, setIsShowChatMenu] = useState(false);
  const [textMessage, setTextMessage] = useState('');

  const [isAddIdOpen, setIsAddIdOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [adding, setAdding] = useState(false);

  // ✅ 화면 폭 상태
  const [isDesktopXL, setIsDesktopXL] = useState<boolean>(window.innerWidth >= 1280);
  useEffect(() => {
    const onResize = () => setIsDesktopXL(window.innerWidth >= 1280);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const formatDateTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const el = document.querySelector('.chat-conversation-box') as HTMLElement | null;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const resolveImg = (p?: string) => {
    if (!p) return `/assets/images/profile-35.png`;
    if (p.startsWith('/uploads')) return `${API_URL}${p}`;
    if (p.startsWith('http')) return p;
    return `/assets/images/${p}`;
  };

  const fetchRooms = async () => {
    if (!user?.nameId) return;
    try {
      const res = await axios.get(`${API_URL}/api/contacts/${user.nameId}`);
      const contacts: any[] = res.data?.contacts;

   if (Array.isArray(contacts)) {
  const normalized = contacts.map((c: any) => ({
    ...c,
    userId: String(c.userId ?? c.nameId ?? ''),
    nameId: c.nameId ? String(c.nameId) : undefined,
    messages: Array.isArray(c.messages) ? c.messages : [],
  }));

  setContactList(normalized);
  setFilteredItems(normalized);
} else {
  setContactList([]);
  setFilteredItems([]);
}
    } catch (e) {
      setContactList([]);
      setFilteredItems([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(logoutUser());
    navigate('/auth/boxed-signin');
  };

  const handleProfile = () => {
    navigate('/users/profile');
  };

  // ✅ 친구추가(상대 아이디 문자열)
  const addFriend = async (targetUserId: string) => {
    try {
      await axios.post(`${API_URL}/api/contacts`, {
        myUserId: user.id, // 서버가 필요하면 유지
        nameId: user.nameId, // ✅ 내 아이디(nameId)
        targetUserId, // ✅ 상대 아이디
      });

      alert('친구추가 완료!');
      fetchRooms();
    } catch (e: any) {
      console.error('친구추가 실패:', e);
      alert(e?.response?.data?.message || '친구추가 실패');
    }
  };

  const delFriend = async (contactId: number) => {
    try {
      await axios.delete(`${API_URL}/api/contacts/${user.id}`, {
        data: { contactId },
      });
      alert('친구삭제 완료!');
      fetchRooms();
    } catch (e: any) {
      console.error('친구삭제 실패:', e);
      alert(e?.response?.data?.message || '친구삭제 실패');
    }
  };

  const openAddIdModal = () => {
    setTargetId('');
    setIsAddIdOpen(true);
  };

  const closeAddIdModal = () => setIsAddIdOpen(false);

  const submitAddById = async () => {
    const targetUserId = targetId.trim();
    if (!targetUserId) {
      alert('아이디를 입력하세요.');
      return;
    }

    try {
      setAdding(true);

      await axios.post(`${API_URL}/api/contacts`, {
        myUserId: user.id,
        nameId: user.nameId,
        targetUserId,
      });

      
      alert('친구추가 완료!');
      fetchRooms();
      closeAddIdModal();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || '친구추가 실패');
    } finally {
      setAdding(false);
    }
  };

  // ✅ 로그인/초기 진입 (nameId 기준)
  useEffect(() => {
    if (!user?.nameId) {
      navigate('/auth/boxed-signin');
      return;
    }

    dispatch(setPageTitle('Chat'));

    if (!socketRef.current) {
      socketRef.current = io(API_URL, { withCredentials: true });
    }

    fetchRooms();

    return () => {
      // 필요하면 연결 끊기
      // socketRef.current?.disconnect();
      // socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.nameId]);

  // ✅ socket 이벤트 수신
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      setContactList((prev) =>
        prev.map((c) =>
          c.contactId === msg.contactId
            ? { ...c, messages: [...(c.messages || []), msg], preview: msg.text, time: msg.time }
            : c
        )
      );

      setSelectedUser((prev) => {
        if (!prev) return prev;
        if (prev.contactId !== msg.contactId) return prev;
        return { ...prev, messages: [...(prev.messages || []), msg], preview: msg.text, time: msg.time };
      });

      scrollToBottom();
    };

    socket.on('newMessage', onNewMessage);
    return () => {
      socket.off('newMessage', onNewMessage);
    };
  }, []);

  // ✅ 검색 + 탭별 리스트
  useEffect(() => {
    const keyword = searchUser.toLowerCase();
    let base: Contact[] = [];

    if (tab === 'chats' || tab === 'contacts' || tab === 'users') base = contactList;
    else base = [];

    setFilteredItems(base.filter((d) => (d.name || '').toLowerCase().includes(keyword)));
  }, [searchUser, contactList, tab]);

  const selectUser = (person: Contact) => {
    setSelectedUser(person);
    setIsShowUserChat(true);
    setIsShowChatMenu(false);
    setTab('chats');

    const socket = socketRef.current;
    if (socket) socket.emit('joinRoom', { contactId: person.contactId });

    scrollToBottom();
  };

  // ✅ 메시지 전송 (fromUserId = 내 nameId)
  const sendMessage = async () => {
    if (!textMessage.trim() || !selectedUser) return;

//const to = String(selectedUser.nameId ?? selectedUser.userId);

const to = String(selectedUser.userId ?? selectedUser.nameId ?? '');



 const payload = {
  contactId: selectedUser.contactId,
  fromUserId: String(user.nameId),   // 무조건 내 nameId(문자)
  toUserId: to,                      // 상대도 nameId 우선
  text: textMessage.trim(),
};
    try {
      await axios.post(`${API_URL}/api/messages`, payload);
      setTextMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('메시지 보내기 실패:', err);
      alert('메시지 보내는 데 실패했습니다.');
    }
  };

  const sendMessageHandle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ RIGHT 패널 숨김 조건
  const hideRightPanel = tab === 'contacts' || (!isShowUserChat && !isDesktopXL);

  // ✅ 내 아이디 후보 (nameId + id 둘 다 인정)
  const myIds = new Set([String(user.nameId), String(user.id)]);

  return (
    <div>
      <div className={`relative flex items-stretch gap-5 h-[calc(100vh_-_150px)] min-h-[calc(100vh_-_150px)] ${isShowChatMenu ? 'min-h-[999px]' : ''}`}>
        {/* LEFT */}
        <div
          className={`panel p-0 flex flex-col flex-none max-w-xs w-full absolute top-0 xl:relative z-10 overflow-hidden h-full min-h-0
            ${(!isShowUserChat || isShowChatMenu || tab === 'contacts' || tab === 'users') ? 'block' : 'hidden'} xl:block
          `}
        >
          <div className="p-4 flex flex-col h-full min-h-0">
            {/* header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-none">
                  <img src={resolveImg(user.profileImage)} alt="img" className="w-24 h-24 rounded-full object-cover mb-5" />
                </div>
                <div className="mx-3">
                  <p className="mb-1 font-semibold">{user.nameId}</p>
                  <p className="mb-1 font-semibold">{user.name}</p>
                  <p className="text-xs text-white-dark">{user.email}</p>
                </div>
              </div>

              <div className="dropdown">
                <Dropdown
                  offset={[0, 5]}
                  placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                  btnClassName="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light w-8 h-8 rounded-full !flex justify-center items-center hover:text-primary"
                  button={<IconHorizontalDots className="opacity-70" />}
                >
                  <ul className="whitespace-nowrap">
                    <li>
                      <button type="button" onClick={handleProfile} className="w-full flex items-center px-4 !py-3">
                        <IconSettings className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />
                        프로필 편집
                      </button>
                    </li>
                    <li>
                      <button type="button">
                        <IconHelpCircle className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />
                        Help & feedback
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={handleLogout} className="text-danger !py-3 w-full flex items-center px-4">
                        <IconLogout className="text-danger w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                        로그아웃
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            {/* search */}
            <div className="relative">
              <input
                type="text"
                className="form-input peer ltr:pr-9 rtl:pl-9"
                placeholder="검색"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch />
              </div>
            </div>

            {/* tabs */}
            <div className="flex justify-between items-center text-xs mt-4">
              <button
                type="button"
                className={`hover:text-primary ${tab === 'users' ? 'text-primary' : ''}`}
                onClick={() => {
                  setTab('users');
                  setIsShowUserChat(false);
                  setSelectedUser(null);
                  setIsShowChatMenu(false);
                }}
              >
                <IconUser className="mx-auto mb-1" />
                사용자
              </button>

              <button type="button" className={`hover:text-primary ${tab === 'chats' ? 'text-primary' : ''}`} onClick={() => setTab('chats')}>
                <IconMessagesDot className="mx-auto mb-1" />
                채팅
              </button>

              <button type="button" className={`hover:text-primary ${tab === 'calls' ? 'text-primary' : ''}`} onClick={() => setTab('calls')}>
                <IconPhone className="mx-auto mb-1" />
                전화
              </button>

              <button
                type="button"
                className={`hover:text-primary ${tab === 'contacts' ? 'text-primary' : ''}`}
                onClick={() => {
                  setTab('contacts');
                  setIsShowUserChat(false);
                  setSelectedUser(null);
                  setIsShowChatMenu(false);
                }}
              >
                <IconUserPlus className="mx-auto mb-1" />
                연락처
              </button>

              <button type="button" className={`hover:text-primary ${tab === 'noti' ? 'text-primary' : ''}`} onClick={() => setTab('noti')}>
                <IconBell className="w-5 h-5 mx-auto mb-1" />
                공지
              </button>
            </div>

            <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]" />

            {/* contacts 탭에서만 친구추가 */}
            {tab === 'contacts' && (
              <div className="mt-3">
                <button type="button" className="btn w-full btn-primary" onClick={openAddIdModal}>
                  <IconUserPlus className="mr-2" /> 친구 추가
                </button>
              </div>
            )}

            {/* LIST */}
            <div className="!mt-0 flex-1 min-h-0">
              <PerfectScrollbar className="chat-users relative h-full space-y-0.5 ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5">
                {/* CHATS */}
                {tab === 'chats' &&
                  (filteredItems.length > 0 ? (
                    filteredItems.map((person: Contact) => (
                      <div key={`${person.contactId}-${person.userId}`}>
                        <button
                          type="button"
                          className={`w-full flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-[#050b14] rounded-md dark:hover:text-primary hover:text-primary ${
                            selectedUser && selectedUser.userId === person.userId ? 'bg-gray-100 dark:bg-[#050b14] dark:text-primary text-primary' : ''
                          }`}
                          onClick={() => selectUser(person)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 relative">
                                <img src={resolveImg(person.path)} className="rounded-full h-12 w-12 object-cover" alt="" />
                                {!!person.active && (
                                  <div className="absolute bottom-0 ltr:right-0 rtl:left-0">
                                    <div className="w-4 h-4 bg-success rounded-full" />
                                  </div>
                                )}
                              </div>
                              <div className="mx-3 ltr:text-left rtl:text-right">
                                <p className="mb-1 font-semibold">{person.name}</p>
                                <p className="text-xs text-white-dark truncate max-w-[185px]">
                                  {person.preview || person.messages?.[person.messages.length - 1]?.text || ''}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold whitespace-nowrap text-xs">
                            <p>{formatDateTime(person.time)}</p>
                          </div>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-4">No chats</div>
                  ))}

                {/* CONTACTS */}
                {tab === 'contacts' &&
                  (filteredItems.length > 0 ? (
                    filteredItems.map((c: Contact) => (
                      <div key={`${c.contactId}-${c.userId}`}>
                        <div className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-[#050b14] rounded-md">
                          <div className="flex items-center gap-3">
                            <img src={resolveImg(c.path)} className="rounded-full h-12 w-12 object-cover" alt="" />
                            <div className="ltr:text-left rtl:text-right">
                              <p className="font-semibold">{c.name}</p>
                              <p className="text-xs text-white-dark">ID: {c.userId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => selectUser(c)}>
                              Chat
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-success" onClick={() => delFriend(c.contactId)}>
                              친구삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-4">No contacts</div>
                  ))}

                {/* USERS */}
                {tab === 'users' &&
                  (filteredItems.length > 0 ? (
                    filteredItems.map((c: Contact) => (
                      <div key={`${c.contactId}-${c.userId}`}>
                        <div className="w-full flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-[#050b14] rounded-md">
                          <div className="flex items-center gap-3">
                            <img src={resolveImg(c.path)} className="rounded-full h-12 w-12 object-cover" alt="" />
                            <div className="ltr:text-left rtl:text-right">
                              <p className="font-semibold">{c.name}</p>
                              <p className="text-xs text-white-dark">ID: {c.userId}</p>
                            </div>
                          </div>

                          <button type="button" className="btn btn-sm btn-outline-success" onClick={() => addFriend(c.userId)}>
                            친구추가
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-4">No users</div>
                  ))}

                {(tab === 'calls' || tab === 'noti') && <div className="text-center text-gray-400 p-4">Not implemented yet</div>}
              </PerfectScrollbar>
            </div>
          </div>
        </div>

        {/* overlay */}
        <div className={`bg-black/60 z-[5] w-full h-full absolute rounded-md hidden ${isShowChatMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowChatMenu(false)} />

   {/* RIGHT */}
{!hideRightPanel && (
  <div className="panel p-0 flex-1 min-w-0">
    {!isShowUserChat && (
      <div className="flex items-center justify-center h-full relative p-4">
        <button
          type="button"
          onClick={() => setIsShowChatMenu(!isShowChatMenu)}
          className="xl:hidden absolute top-4 ltr:left-4 rtl:right-4 hover:text-primary"
        >
          <IconBack />
        </button>

        <div className="py-8 flex items-center justify-center flex-col">
          <p className="flex justify-center bg-white-dark/20 p-2 font-semibold rounded-md max-w-[220px] mx-auto">
            <IconMessage className="ltr:mr-2 rtl:ml-2" />
            Click User To Chat
          </p>
        </div>
      </div>
    )}

    {isShowUserChat && selectedUser ? (
      // ✅ 핵심: flex-col + min-h-0 + 메시지영역 flex-1
      <div className="flex flex-col h-full min-h-0">
        {/* top bar */}
        <div className="flex justify-between items-center p-4 flex-none">
          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
            <button
              type="button"
              className="xl:hidden hover:text-primary flex-none"
              onClick={() => {
                setIsShowUserChat(false);
                setSelectedUser(null);
              }}
            >
              <IconBack />
            </button>

            <div className="relative flex-none">
              <img
                src={resolveImg(selectedUser.path)}
                className="rounded-full w-10 h-10 sm:h-12 sm:w-12 object-cover"
                alt=""
              />
              {!!selectedUser.active && (
                <div className="absolute bottom-0 ltr:right-0 rtl:left-0">
                  <div className="w-3.5 h-3.5 bg-success rounded-full border-2 border-white dark:border-[#0E1726]" />
                </div>
              )}
            </div>

            <div className="mx-3 min-w-0">
              <p className="font-semibold truncate">{selectedUser.name}</p>
              <p className="text-white-dark text-xs truncate">
                {selectedUser.active ? 'Active now' : `마지막 접속: ${formatDateTime(selectedUser.time)}`}
              </p>
            </div>
          </div>

          <div className="flex sm:gap-5 gap-3 flex-none">
            <button type="button">
              <IconPhoneCall className="hover:text-primary" />
            </button>
            <button type="button">
              <IconVideo className="w-5 h-5 hover:text-primary" />
            </button>

            <div className="dropdown">
              <Dropdown
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light w-8 h-8 rounded-full !flex justify-center items-center"
                button={<IconHorizontalDots className="hover:text-primary rotate-90 opacity-70" />}
              >
                <ul className="text-black dark:text-white-dark">
                  <li><button type="button"><IconSearch className="ltr:mr-2 rtl:ml-2 shrink-0" />검색</button></li>
                  <li><button type="button"><IconCopy className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />복사</button></li>
                  <li><button type="button"><IconTrashLines className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />삭제</button></li>
                  <li><button type="button"><IconShare className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />동기화</button></li>
                  <li><button type="button"><IconSettings className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />프로필 편집</button></li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] flex-none" />

        {/* ✅ conversation (scroll) */}
        <div className="flex-1 min-h-0">
          <PerfectScrollbar className="chat-conversation-box h-full">
      
      {selectedUser.messages?.length ? (
  selectedUser.messages.map((message: any, index: number) => {
    const nameId = String(user.nameId ?? '');
    const myId = String(user.id ?? '');

    // 서버가 어떤 키로 주든 다 잡기
    const from = String(message.fromUserId);
    const to = String(message.toUserId);
    console.log('message.fromUserId:', message.fromUserId);
    console.log('message.toUserId:', message.toUserId);   


    //const isMine = from === myNameId || from === myId;

    const isMine = !message.fromUserId || myIds.has(String(message.fromUserId));



    // ✅ 1번만 강제 로그 (너무 많이 찍히면 브라우저 터짐)
    if (index === 0) {
      console.log('==== DEBUG CHAT ====');
      console.log('nameId:', nameId);
      console.log('myId:', myId);
      console.log('selectedUser.userId:', String(selectedUser.userId));
      console.log('message sample:', message);
      console.log('from:', from, 'to:', to, 'isMine:', isMine);
      console.log('====================');
    }

    return (
      <div key={`${message.time ?? message.created_at ?? index}-${index}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : ''}`}>
          <img
            src={isMine ? resolveImg(user.profileImage) : resolveImg(selectedUser.path)}
            className="rounded-full h-9 w-9 object-cover flex-none"
            alt=""
          />

          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
            {/* ✅ 화면에 from/to도 같이 표시(임시) */}
            <div className="text-[10px] text-white-dark mb-1">
              from:{from} / my:{nameId}
            </div>

            <div
              className={`px-4 py-2 rounded-2xl text-sm break-words ${
                isMine ? 'bg-black/10 dark:bg-gray-800 rounded-br-md' : '!bg-primary text-white rounded-bl-md'
              }`}
            >
              {message.text}
            </div>

            <div className="mt-1 text-[11px] text-white-dark">
              {String(message.time ?? message.created_at ?? '')}
            </div>
          </div>
        </div>
      </div>
    );
  })
) : (
  <div className="text-center text-gray-400 py-10">대화가 없습니다.</div>
)}

          </PerfectScrollbar>
        </div>                    

        {/* ✅ input (bottom, absolute 제거) */}
        <div className="p-4 flex-none border-t border-white-light dark:border-[#1b2e4b]">
          <div className="flex items-center gap-3">
            <button type="button" className="hover:text-primary flex-none">
              <IconMoodSmile />
            </button>

            <input
              className="form-input rounded-full border-0 bg-[#f4f4f4] dark:bg-[#1b2e4b] px-4 py-2 flex-1"
              placeholder="메세지를 입력하세요"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={sendMessageHandle}
            />

            <button type="button" className="hover:text-primary flex-none" onClick={sendMessage}>
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    ) : null}
  </div>
)}


        {/* 아이디 추가 모달 */}
        <Transition appear show={isAddIdOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[999]" onClose={closeAddIdModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black/60" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-[#0E1726]">
                    <Dialog.Title className="text-lg font-bold mb-4">아이디로 친구 추가</Dialog.Title>

                    <div className="space-y-3">
                      <input
                        type="text"
                        className="form-input w-full"
                        placeholder="친구 아이디 입력"
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitAddById();
                        }}
                      />

                      <div className="flex justify-end gap-2">
                        <button type="button" className="btn btn-outline-danger" onClick={closeAddIdModal} disabled={adding}>
                          취소
                        </button>
                        <button type="button" className="btn btn-primary" onClick={submitAddById} disabled={adding}>
                          {adding ? '추가중...' : '추가'}
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Chat;
