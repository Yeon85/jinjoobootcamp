import Dropdown from '../../components/Dropdown';
import { io, Socket } from 'socket.io-client';

import { IRootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef, useMemo } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconSettings from '../../components/Icon/IconSettings';
import IconHelpCircle from '../../components/Icon/IconHelpCircle';
import IconLogin from '../../components/Icon/IconLogin';
import IconSearch from '../../components/Icon/IconSearch';
import IconMessagesDot from '../../components/Icon/IconMessagesDot';
import IconPhone from '../../components/Icon/IconPhone';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconUser from '../../components/Icon/IconUser';
import IconBell from '../../components/Icon/IconBell';
import IconMenu from '../../components/Icon/IconMenu';
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

type Message = {
  contactId: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  time: string;
};

type Contact = {
  contactId: number; // ✅ contacts 테이블 id
  userId: number; // 상대 유저 id
  name: string;
  path: string;
  active: number | boolean;
  time: string; // lastSeenTime
  preview: string;
  messages: Message[];
};

const Chat = () => {
  const formatDateTime = (timeString: string) => {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: IRootState) => state.user);
  const loginUser = {
    id: user.id,
    name: user.name,
    path: user.profileImage,
    designation: user.job_title || 'User',
  };

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

  const API_URL = ApplicationConfig.API_URL;

  // ✅ socket은 렌더마다 새로 만들면 안됨! (useRef/useMemo로 1회만)
  const socketRef = useRef<Socket | null>(null);

  const [tab, setTab] = useState<'users' | 'chats' | 'contacts' | 'calls' | 'noti'>('chats');

  const [contactList, setContactList] = useState<Contact[]>([]);
  const [filteredItems, setFilteredItems] = useState<Contact[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [isShowUserChat, setIsShowUserChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);
  const [textMessage, setTextMessage] = useState('');

  const scrollToBottom = () => {
    setTimeout(() => {
      const element: any = document.querySelector('.chat-conversation-box');
      if (element) element.scrollTop = element.scrollHeight;
    });
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts/${user.id}`);
      const contacts: Contact[] = res.data.contacts;

      if (Array.isArray(contacts)) {
        setContactList(contacts);
        setFilteredItems(contacts);
      } else {
        setContactList([]);
        setFilteredItems([]);
      }
    } catch (e) {
      setContactList([]);
      setFilteredItems([]);
    }
  };

  // ✅ 로그인/초기 진입
  useEffect(() => {
    if (!user.id) {
      navigate('/auth/boxed-signin');
      return;
    }

    dispatch(setPageTitle('Chat'));

    // ✅ socket 연결 (1회)
    if (!socketRef.current) {
      socketRef.current = io(API_URL, { withCredentials: true });
    }

    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // ✅ socket 이벤트 수신
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      // contactList 업데이트
      setContactList((prev) =>
        prev.map((c) =>
          c.contactId === msg.contactId
            ? {
                ...c,
                messages: [...(c.messages || []), msg],
                preview: msg.text,
                time: msg.time,
              }
            : c
        )
      );

      // 현재 보고있는 방이면 selectedUser도 업데이트
      setSelectedUser((prev) => {
        if (!prev) return prev;
        if (prev.contactId !== msg.contactId) return prev;

        return {
          ...prev,
          messages: [...(prev.messages || []), msg],
          preview: msg.text,
          time: msg.time,
        };
      });

      scrollToBottom();
    };

    socket.on('newMessage', onNewMessage);

    return () => {
      socket.off('newMessage', onNewMessage);
    };
  }, []);

  // ✅ 검색 필터
  useEffect(() => {
    setFilteredItems(() => {
      return contactList.filter((d) => d.name?.toLowerCase().includes(searchUser.toLowerCase()));
    });
  }, [searchUser, contactList]);

  const selectUser = (person: Contact) => {
    setSelectedUser(person);
    setIsShowUserChat(true);
    setIsShowChatMenu(false);

    // ✅ 방 조인(연락처 id)
    const socket = socketRef.current;
    if (socket) socket.emit('joinRoom', { contactId: person.contactId });

    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!textMessage.trim() || !selectedUser) return;

    // ✅ 너가 말한 핵심: contactId는 selectedUser.messages[0].contactId 로 보냄
    // 단, messages가 비어있으면 터지니까 fallback도 같이 둠
    const contactId =
      selectedUser?.messages?.[0]?.contactId ?? selectedUser.contactId; // 안전장치

    const payload = {
      contactId, // ✅ 핵심
      fromUserId: user.id,
      toUserId: selectedUser.userId,
      text: textMessage,
    };

    try {
      await axios.post(`${API_URL}/api/messages`, payload);

      // ✅ 소켓 방식이면 서버가 newMessage emit 해줄거라
      // 여기서는 입력창만 비우고 끝내도 됨.
      setTextMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('메시지 보내기 실패:', err);
      alert('메시지 보내는 데 실패했습니다.');
    }
  };

  const sendMessageHandle = (e: any) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div>
      <div className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full sm:min-h-0 ${isShowChatMenu ? 'min-h-[999px]' : ''}`}>
        <div
          className={`panel p-0 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full hidden xl:block overflow-hidden ${
            isShowChatMenu ? '!block' : ''
          }`}
        >
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-none">
                  <img src={`${API_URL}${user.profileImage}`} alt="img" className="w-24 h-24 rounded-full object-cover  mb-5" />
                </div>
                <div className="mx-3">
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
                      <button type="button">
                        <IconSettings className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />
                        Settings
                      </button>
                    </li>
                    <li>
                      <button type="button">
                        <IconHelpCircle className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />
                        Help & feedback
                      </button>
                    </li>
                    <li>
                      <button type="button">
                        <IconLogin className="ltr:mr-1 rtl:ml-1 shrink-0" />
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                className="form-input peer ltr:pr-9 rtl:pl-9"
                placeholder="Searching..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-4">
              <button type="button" className="hover:text-primary">
                <IconUser className="mx-auto mb-1" />
                Users
              </button>

              <button type="button" className="hover:text-primary">
                <IconMessagesDot className="mx-auto mb-1" />
                Chats
              </button>

              <button type="button" className="hover:text-primary" onClick={() => navigate('/call')}>
                <IconPhone className="mx-auto mb-1" />
                Calls
              </button>

              <button type="button" className="hover:text-primary" onClick={() => navigate('/apps/contacts')}>
                <IconUserPlus className="mx-auto mb-1" />
                Contacts
              </button>

              <button type="button" className="hover:text-primary group">
                <IconBell className="w-5 h-5 mx-auto mb-1" />
                Notification
              </button>
            </div>

            <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

            <div className="!mt-0">
              <PerfectScrollbar className="chat-users relative h-full min-h-[100px] sm:h-[calc(100vh_-_357px)] space-y-0.5 ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5">
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((person: Contact) => (
                    <div key={person.userId}>
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
                              <img src={`${API_URL}${person.path}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                              {!!person.active && (
                                <div className="absolute bottom-0 ltr:right-0 rtl:left-0">
                                  <div className="w-4 h-4 bg-success rounded-full"></div>
                                </div>
                              )}
                            </div>

                            <div className="mx-3 ltr:text-left rtl:text-right">
                              <p className="mb-1 font-semibold">{person.name}</p>
                              <p className="text-xs text-white-dark truncate max-w-[185px]">{person.preview}</p>
                            </div>
                          </div>
                        </div>

                        <div className="font-semibold whitespace-nowrap text-xs">
                          <p>{person.time}</p>
                        </div>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 p-4">No contacts found</div>
                )}
              </PerfectScrollbar>
            </div>
          </div>
        </div>

        <div
          className={`bg-black/60 z-[5] w-full h-full absolute rounded-md hidden ${isShowChatMenu ? '!block xl:!hidden' : ''}`}
          onClick={() => setIsShowChatMenu(!isShowChatMenu)}
        ></div>

        <div className="panel p-0 flex-1">
          {!isShowUserChat && (
            <div className="flex items-center justify-center h-full relative p-4">
              <button type="button" onClick={() => setIsShowChatMenu(!isShowChatMenu)} className="xl:hidden absolute top-4 ltr:left-4 rtl:right-4 hover:text-primary">
                <IconMenu />
              </button>

              <div className="py-8 flex items-center justify-center flex-col">
                <div className="w-[280px] md:w-[430px] mb-8 h-[calc(100vh_-_320px)] min-h-[120px] text-white dark:text-black">
                  {/* 원래 SVG 그대로 (너무 길어서 생략 안하고 유지하고 싶으면 여기에 그대로 붙여 넣으면 됨) */}
                  <div className="w-full h-full flex items-center justify-center text-white-dark">
                    Select a user to start chatting
                  </div>
                </div>

                <p className="flex justify-center bg-white-dark/20 p-2 font-semibold rounded-md max-w-[190px] mx-auto">
                  <IconMessage className="ltr:mr-2 rtl:ml-2" />
                  Click User To Chat
                </p>
              </div>
            </div>
          )}

          {isShowUserChat && selectedUser ? (
            <div className="relative h-full">
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}>
                    <IconMenu />
                  </button>

                  <div className="relative flex-none">
                    <img src={`${API_URL}${selectedUser.path}`} className="rounded-full w-10 h-10 sm:h-12 sm:w-12 object-cover" alt="" />
                    <div className="absolute bottom-0 ltr:right-0 rtl:left-0">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                    </div>
                  </div>

                  <div className="mx-3">
                    <p className="font-semibold">{selectedUser.name}</p>
                    <p className="text-white-dark text-xs">{selectedUser.active ? 'Active now' : 'Last seen at ' + selectedUser.time}</p>
                  </div>
                </div>

                <div className="flex sm:gap-5 gap-3">
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
                            Search
                          </button>
                        </li>
                        <li>
                          <button type="button">
                            <IconCopy className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Copy
                          </button>
                        </li>
                        <li>
                          <button type="button">
                            <IconTrashLines className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Delete
                          </button>
                        </li>
                        <li>
                          <button type="button">
                            <IconShare className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Share
                          </button>
                        </li>
                        <li>
                          <button type="button">
                            <IconSettings className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Settings
                          </button>
                        </li>
                      </ul>
                    </Dropdown>
                  </div>
                </div>
              </div>

              <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

              <PerfectScrollbar className="relative h-full sm:h-[calc(100vh_-_300px)] chat-conversation-box">
                <div className="space-y-5 p-4 sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">
                  <div className="block m-6 mt-0">
                    <h4 className="text-xs text-center border-b border-[#f4f4f4] dark:border-gray-800 relative">
                      <span className="relative top-2 px-3 bg-white dark:bg-black">{'Today, ' + selectedUser.time}</span>
                    </h4>
                  </div>

                  {selectedUser.messages && selectedUser.messages.length ? (
                    <>
                      {selectedUser.messages.map((message: Message, index: number) => (
                        <div key={index}>
                          <div className={`flex items-start gap-3 ${loginUser.id === message.fromUserId ? 'justify-end' : ''}`}>
                            <div className={`flex-none ${loginUser.id === message.fromUserId ? 'order-2' : ''}`}>
                              {loginUser.id === message.fromUserId ? (
                                <img src={`${API_URL}${user.profileImage}`} className="rounded-full h-10 w-10 object-cover" alt="" />
                              ) : (
                                <img src={`${API_URL}${selectedUser.path}`} className="rounded-full h-10 w-10 object-cover" alt="" />
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`dark:bg-gray-800 p-4 py-2 rounded-md bg-black/10 ${
                                    message.fromUserId === selectedUser.userId
                                      ? 'ltr:rounded-br-none rtl:rounded-bl-none !bg-primary text-white'
                                      : 'ltr:rounded-bl-none rtl:rounded-br-none'
                                  }`}
                                >
                                  {message.text}
                                </div>
                                <div className={`${loginUser.id === message.fromUserId ? 'hidden' : ''}`}>
                                  <IconMoodSmile className="hover:text-primary" />
                                </div>
                              </div>

                              <div className={`text-xs text-white-dark ${loginUser.id === message.fromUserId ? 'ltr:text-right rtl:text-left' : ''}`}>
                                {message.time ? formatDateTime(message.time) : '5h ago'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </PerfectScrollbar>

              <div className="p-4 absolute bottom-0 left-0 w-full">
                <div className="sm:flex w-full space-x-3 rtl:space-x-reverse items-center">
                  <div className="relative flex-1">
                    <input
                      className="form-input rounded-full border-0 bg-[#f4f4f4] px-12 focus:outline-none py-2"
                      placeholder="Type a message"
                      value={textMessage}
                      onChange={(e: any) => setTextMessage(e.target.value)}
                      onKeyUp={sendMessageHandle}
                    />
                    <button type="button" className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 hover:text-primary">
                      <IconMoodSmile />
                    </button>
                    <button
                      type="button"
                      className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 hover:text-primary"
                      onClick={() => sendMessage()}
                    >
                      <IconSend />
                    </button>
                  </div>

                  <div className="items-center space-x-3 rtl:space-x-reverse sm:py-0 py-3 hidden sm:block">
                    <button type="button" className="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light rounded-md p-2 hover:text-primary">
                      <IconMicrophoneOff />
                    </button>
                    <button type="button" className="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light rounded-md p-2 hover:text-primary">
                      <IconDownload />
                    </button>
                    <button type="button" className="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light rounded-md p-2 hover:text-primary">
                      <IconCamera />
                    </button>
                    <button type="button" className="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light rounded-md p-2 hover:text-primary">
                      <IconHorizontalDots className="opacity-70" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
