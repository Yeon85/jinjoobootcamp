import Dropdown from '../../components/Dropdown';
import { IRootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
import { useNavigate } from "react-router-dom";

type Message = {
  contactId: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  time: string;
};

type Contact = {
  contactId: number;
  userId: number;      // 상대 유저 id
  name: string;
  path: string;
  active: number | boolean;
  time: string;        // lastSeenTime
  preview: string;
  messages: Message[];
};

const Chat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: IRootState) => state.user);

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

  const API_URL = ApplicationConfig.API_URL;

  const [contactList, setContactList] = useState<Contact[]>([]);
  const [filteredItems, setFilteredItems] = useState<Contact[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [isShowUserChat, setIsShowUserChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);
  const [textMessage, setTextMessage] = useState('');

  const formatDateTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!user.id) {
      navigate("/auth/boxed-signin");
      return;
    }
    fetchContacts();
  }, [user.id]);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts/${user.id}`);
      const contacts: Contact[] = res.data.contacts;

      if (Array.isArray(contacts)) {
        setContactList(contacts);
        setFilteredItems(contacts); // ✅ 절대 messages 넣으면 안됨
      } else {
        setContactList([]);
        setFilteredItems([]);
      }
    } catch (e) {
      setContactList([]);
      setFilteredItems([]);
    }
  };

  useEffect(() => {
    setFilteredItems(
      contactList.filter((d) => d.name.toLowerCase().includes(searchUser.toLowerCase()))
    );
  }, [searchUser, contactList]);

  const selectUser = (person: Contact) => {
    console.log("선택:", person, "messages:", person?.messages?.length);
    setSelectedUser(person);
    setIsShowUserChat(true);
    setIsShowChatMenu(false);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const el: any = document.querySelector('.chat-conversation-box');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const sendMessage = async () => {
    if (!textMessage.trim() || !selectedUser) return;

    const newMessage = {
      contactId: selectedUser.contactId,
      fromUserId: user.id,
      toUserId: selectedUser.userId,
      text: textMessage,
    };

    try {
      await axios.post(`${API_URL}/api/messages`, newMessage);

      // ✅ 화면 반영 (selectedUser / contactList 둘 다 업데이트)
      const msgToAdd: Message = { ...newMessage, time: new Date().toISOString() };

      // contactList 업데이트
      setContactList((prev) =>
        prev.map((c) =>
          c.contactId === selectedUser.contactId
            ? { ...c, messages: [...(c.messages || []), msgToAdd], preview: msgToAdd.text }
            : c
        )
      );

      // selectedUser도 업데이트 (안하면 오른쪽이 안 바뀜)
      setSelectedUser((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), msgToAdd], preview: msgToAdd.text } : prev
      );

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
        {/* LEFT */}
        <div className={`panel p-0 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full hidden xl:block overflow-hidden ${isShowChatMenu ? '!block' : ''}`}>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-none">
                  <img src={`${API_URL}${user.profileImage}`} alt="img" className="w-24 h-24 rounded-full object-cover mb-5" />
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
                    <li><button type="button"><IconSettings className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />Settings</button></li>
                    <li><button type="button"><IconHelpCircle className="w-4.5 h-4.5 ltr:mr-1 rtl:ml-1 shrink-0" />Help & feedback</button></li>
                    <li><button type="button"><IconLogin className="ltr:mr-1 rtl:ml-1 shrink-0" />Sign Out</button></li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div className="relative">
              <input className="form-input peer ltr:pr-9 rtl:pl-9" placeholder="Searching..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
              <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 peer-focus:text-primary"><IconSearch /></div>
            </div>

            <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] mt-4"></div>

            <PerfectScrollbar className="chat-users relative h-full min-h-[100px] sm:h-[calc(100vh_-_280px)] space-y-0.5 ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5">
              {filteredItems.length > 0 ? (
                filteredItems.map((person) => (
                  <div key={person.contactId}>
                    <button
                      type="button"
                      className={`w-full flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-[#050b14] rounded-md dark:hover:text-primary hover:text-primary ${
                        selectedUser && selectedUser.contactId === person.contactId ? 'bg-gray-100 dark:bg-[#050b14] dark:text-primary text-primary' : ''
                      }`}
                      onClick={() => selectUser(person)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 relative">
                            <img src={`/assets/images/${person.path}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                          </div>
                          <div className="mx-3 ltr:text-left rtl:text-right">
                            <p className="mb-1 font-semibold">{person.name}</p>
                            <p className="text-xs text-white-dark truncate max-w-[185px]">{person.preview}</p>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold whitespace-nowrap text-xs">
                        <p>{person.time ? formatDateTime(person.time) : ''}</p>
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

        {/* RIGHT */}
        <div className="panel p-0 flex-1">
          {!isShowUserChat && (
            <div className="flex items-center justify-center h-full relative p-4">
              <button type="button" onClick={() => setIsShowChatMenu(!isShowChatMenu)} className="xl:hidden absolute top-4 ltr:left-4 rtl:right-4 hover:text-primary">
                <IconMenu />
              </button>
              <div className="py-8 flex items-center justify-center flex-col">
                <p className="flex justify-center bg-white-dark/20 p-2 font-semibold rounded-md max-w-[190px] mx-auto">
                  <IconMessage className="ltr:mr-2 rtl:ml-2" />
                  Click User To Chat
                </p>
              </div>
            </div>
          )}

          {isShowUserChat && selectedUser && (
            <div className="relative h-full">
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}><IconMenu /></button>
                  <div className="relative flex-none">
                    <img src={`/assets/images/${selectedUser.path}`} className="rounded-full w-10 h-10 sm:h-12 sm:w-12 object-cover" alt="" />
                  </div>
                  <div className="mx-3">
                    <p className="font-semibold">{selectedUser.name}</p>
                    <p className="text-white-dark text-xs">{selectedUser.active ? 'Active now' : 'Last seen at ' + formatDateTime(selectedUser.time)}</p>
                  </div>
                </div>
                <div className="flex sm:gap-5 gap-3">
                  <button type="button"><IconPhoneCall className="hover:text-primary" /></button>
                  <button type="button"><IconVideo className="w-5 h-5 hover:text-primary" /></button>
                </div>
              </div>

              <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

              <PerfectScrollbar className="relative h-full sm:h-[calc(100vh_-_300px)] chat-conversation-box">
                <div className="space-y-5 p-4 sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">
                  {selectedUser.messages && selectedUser.messages.length > 0 ? (
                    selectedUser.messages.map((message, index) => (
                      <div key={index}>
                        <div className={`flex items-start gap-3 ${user.id === message.fromUserId ? 'justify-end' : ''}`}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`dark:bg-gray-800 p-4 py-2 rounded-md bg-black/10 ${
                                  user.id === message.fromUserId
                                    ? 'ltr:rounded-bl-none rtl:rounded-br-none !bg-primary text-white'
                                    : 'ltr:rounded-br-none rtl:rounded-bl-none'
                                }`}
                              >
                                {message.text}
                              </div>
                            </div>
                            <div className={`text-xs text-white-dark ${user.id === message.fromUserId ? 'ltr:text-right rtl:text-left' : ''}`}>
                              {message.time ? formatDateTime(message.time) : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-10">메시지가 없습니다.</div>
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
                    <button type="button" className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 hover:text-primary" onClick={sendMessage}>
                      <IconSend />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
