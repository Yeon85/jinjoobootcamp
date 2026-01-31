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

import ApplicationConfig from '../../application';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Dialog, Transition } from '@headlessui/react';

// 추가
import { logoutUser } from '@/store/userSlice';
import IconLogout from '../../components/Icon/IconLogout';

type Tab = 'users' | 'chats' | 'contacts' | 'calls' | 'noti';

type Message = {
  contactId: number;
  fromUserId: string;
  toUserId: string;
  text: string;
  time: string; // created_at 등
};

type Contact = {
  contactId: number;
  userId: string;
  name: string;
  nameId: string;
  targetUserId: string;
  targetUerName: string;
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

  const [textMessage, setTextMessage] = useState('');
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);

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

  /* ===========================
     ✅ iOS/Safari 안전한 날짜 파싱
     =========================== */
  const parseMysqlKST = (s?: string) => {
    if (!s) return null;

    // ISO(예: 2026-01-30T00:12:58.000Z, 2026-01-30T09:12:58+09:00)
    if (s.includes('T')) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    // MySQL "YYYY-MM-DD HH:mm:ss" → KST(+09:00) 강제
    const d = new Date(s.replace(' ', 'T') + '+09:00');
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime = (timeString: string) => {
    const d = parseMysqlKST(timeString);
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatChatTime = (s?: string) => {
    const d = parseMysqlKST(s);
    if (!d) return '';

    const now = new Date();
    const isToday =
      d.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) ===
      now.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

    if (isToday) {
      return d.toLocaleTimeString('ko-KR', {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    return d.toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatKST = (s?: string) => {
    const d = parseMysqlKST(s);
    if (!d) return '';
    return d.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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

  // ✅ snake_case / camelCase 어떤 메시지가 와도 통일
  const normalizeMessage = (m: any): Message => {
    return {
      contactId: Number(m.contactId ?? m.contact_id ?? 0),
      fromUserId: String(m.fromUserId ?? m.from_user_id ?? m.from ?? ''),
      toUserId: String(m.toUserId ?? m.to_user_id ?? m.to ?? ''),
      text: String(m.text ?? m.message ?? ''),
      time: String(m.time ?? m.created_at ?? m.createdAt ?? ''),
    };
  };

  const normalizeContact = (c: any): Contact => {
    const msgsRaw = Array.isArray(c.messages) ? c.messages : [];
    const msgs = msgsRaw.map(normalizeMessage);

    const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;

    return {
      ...c,
      contactId: Number(c.contactId ?? c.contact_id ?? 0),
      userId: String(c.userId ?? c.nameId ?? c.otherUserId ?? ''),
      name: String(c.name ?? ''),
      targetUserId: String(c.targetUserId ?? ''),    
      targetUerName: String(c.targetUserName ?? ''),      
      nameId: c.nameId ? String(c.nameId) : undefined,
      path: c.path,
      active: c.active ?? 0,
      time: String(c.time ?? c.lastSeenTime ?? lastMsg?.time ?? ''),
      preview: c.preview ?? c.lastPreview ?? lastMsg?.text ?? '',
      messages: msgs,
    };
  };

  const fetchRooms = async () => {
    if (!user?.nameId) return;

    try {
      const res = await axios.get(`${API_URL}/api/contacts/${user.nameId}`);
      const contacts: any[] = res.data?.contacts;

      if (Array.isArray(contacts)) {
        const normalized = contacts.map(normalizeContact);
        setContactList(normalized);
        setFilteredItems(normalized);

        // 선택된 유저가 있으면 최신 객체로 갱신
        setSelectedUser((prev) => {
          if (!prev) return prev;
          const found = normalized.find((x) => x.contactId === prev.contactId);
          return found ?? prev;
        });
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
        myUserId: user.id,
        nameId: user.nameId,
        targetUserId,
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
      await axios.delete(`${API_URL}/api/contacts/${user.nameId}`, {
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
      // socketRef.current?.disconnect();
      // socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.nameId]);

  // ✅ socket 이벤트 수신
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onNewMessage = (raw: any) => {
      let msg = normalizeMessage(raw);

      const myNameId = String(user.nameId ?? '');

      // ✅ 1) fromUserId 보정
      if (!msg.fromUserId) {
        if (raw.fromUserId) msg.fromUserId = String(raw.fromUserId);
        else msg.fromUserId = myNameId;
      }

      // ✅ 2) toUserId 보정
      if (!msg.toUserId) {
        if (raw.toUserId) {
          msg.toUserId = String(raw.toUserId);
        } else if (selectedUser && selectedUser.contactId === msg.contactId) {
          msg.toUserId = String(selectedUser.userId ?? selectedUser.nameId ?? '');
        }
      }

      // ✅ 3) 최종 안전장치
      if (!msg.toUserId && msg.fromUserId === myNameId && selectedUser) {
        msg.toUserId = String(selectedUser.userId ?? selectedUser.nameId ?? '');
      }

      console.log('>>> newMessage FINAL', {
        from: msg.fromUserId,
        to: msg.toUserId,
        text: msg.text,
        time: msg.time,
      });

      // === 상태 반영 ===
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
    };

    socket.on('newMessage', onNewMessage);
    return () => {
      socket.off('newMessage', onNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 검색 + 탭별 리스트
  useEffect(() => {
    const keyword = searchUser.toLowerCase();
    let base: Contact[] = [];

    if (tab === 'chats' || tab === 'contacts' || tab === 'users') base = contactList;
    else base = [];

    console.log("contactList:"+JSON.stringify(contactList));
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

  // ✅ 메시지 전송
  const sendMessage = async () => {
    if (!textMessage.trim() || !selectedUser) return;

    const to = String(selectedUser.userId ?? selectedUser.nameId ?? '');

    const payload = {
      contactId: selectedUser.contactId,
      fromUserId: String(user.nameId ?? ''),
      toUserId: to,
      text: textMessage.trim(),
    };

    console.log('✅ [SEND payload]', payload);

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
  const myIds = new Set([String(user.nameId ?? ''), String(user.id ?? '')]);

  return (
    <div>
      <div
        className={`relative flex items-stretch gap-5 h-[calc(100vh_-_150px)] min-h-[calc(100vh_-_150px)] ${
          isShowChatMenu ? 'min-h-[999px]' : ''
        }`}
      >
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
                  <img
                    src={resolveImg(user.profileImage)}
                    alt="img"
                    className="w-24 h-24 rounded-full object-cover mb-5"
                  />
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
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-danger !py-3 w-full flex items-center px-4"
                      >
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
                      <div key={`${person.contactId}-${person.nameId}`}>
                        <button
                          type="button"
                          className={`w-full flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-[#050b14] rounded-md dark:hover:text-primary hover:text-primary ${
                            selectedUser && selectedUser.nameId === person.nameId
                              ? 'bg-gray-100 dark:bg-[#050b14] dark:text-primary text-primary'
                              : ''
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
                            <p>{formatChatTime(person.time)}</p>
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
                              <p className="text-xs text-white-dark">ID: {c.targetUserId}</p>
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
                              <p className="text-xs text-white-dark"> ID: {c.targetUserId}</p>
                            </div>
                          </div>
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
        <div
          className={`bg-black/60 z-[5] w-full h-full absolute rounded-md hidden ${isShowChatMenu ? '!block xl:!hidden' : ''}`}
          onClick={() => setIsShowChatMenu(false)}
        />

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
                      <img src={resolveImg(selectedUser.path)} className="rounded-full w-10 h-10 sm:h-12 sm:w-12 object-cover" alt="" />
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
                          <li>
                            <button type="button">
                              <IconSearch className="ltr:mr-2 rtl:ml-2 shrink-0" />
                              검색
                            </button>
                          </li>
                          <li>
                            <button type="button">
                              <IconCopy className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                              복사
                            </button>
                          </li>
                          <li>
                            <button type="button">
                              <IconTrashLines className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                              삭제
                            </button>
                          </li>
                          <li>
                            <button type="button">
                              <IconShare className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                              동기화
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={handleProfile}>
                              <IconSettings className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                              프로필
                            </button>
                          </li>
                        </ul>
                      </Dropdown>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] flex-none" />

                {/* conversation */}
                <div className="flex-1 min-h-0">
                  <PerfectScrollbar className="chat-conversation-box h-full">
                    {selectedUser.messages?.length ? (
                      selectedUser.messages.map((raw: any, index: number) => {
                        const message = normalizeMessage(raw);

                        const fromId = String(message.fromUserId ?? '');
                        const toId = String(message.toUserId ?? '');
                        const isMine = myIds.has(fromId);

                        // 첫 메시지 1번만 디버깅
                        if (index === 0) {
                          console.log('==== DEBUG CHAT ====');
                          console.log('raw keys:', Object.keys(raw));
                          console.log('raw:', raw);
                          console.log('normalized:', message);
                          console.log('myIds:', Array.from(myIds));
                          console.log('from:', fromId, 'to:', toId, 'isMine:', isMine);
                          console.log('time raw:', message.time, 'parsed:', parseMysqlKST(message.time));
                          console.log('====================');
                        }

                        return (
                          <div key={`${message.time || 't'}-${index}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : ''}`}>
                              <img
                                src={isMine ? resolveImg(user.profileImage) : resolveImg(selectedUser.path)}
                                className="rounded-full h-9 w-9 object-cover flex-none"
                                alt=""
                              />

                              <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`px-4 py-2 rounded-2xl text-sm break-words ${
                                    isMine ? 'bg-black/10 dark:bg-gray-800 rounded-br-md' : '!bg-primary text-white rounded-bl-md'
                                  }`}
                                >
                                  {message.text}
                                </div>

                                <div className="mt-1 text-[11px] text-white-dark">
                                  <div>{formatChatTime(message.time)}</div>
                                  {/* <div>{formatKST(message.time)}</div> */}
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

                {/* input */}
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
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
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
