import FullCalendar from '@fullcalendar/react';
// import '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch,useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPlus from '../../components/Icon/IconPlus';
import IconX from '../../components/Icon/IconX';
//추가
import axios from 'axios';
import { IRootState } from '../../store';
import { useRef } from 'react';
import ApplicationConfig from '../../application';

function getDefaultStartDateTime() {
    const now = new Date();
    now.setHours(8, 30, 0, 0);
    return now.toISOString().slice(0, 16);
  }
  
  function getDefaultEndDateTime() {
    const now = new Date();
    now.setHours(9, 30, 0, 0);
    return now.toISOString().slice(0, 16);
  }

const Calendar = () => {
    const dispatch = useDispatch();
    const titleRef = useRef<HTMLInputElement>(null);
    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);
    const API_URL = ApplicationConfig.API_URL;

    useEffect(() => {
        dispatch(setPageTitle('Calendar'));
    
        const fetchData = async () => {
            try {
                await fetchEvents();
            } catch (error) {
                console.error('이벤트 불러오기 실패', error);
            }
        };
    
        fetchData();
    }, [dispatch]);
    const now = new Date();
    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/calendar`);
            setEvents(res.data);
        } catch (err) {
            console.error('일정 불러오기 실패:', err);
        }
    };
    const deleteEvent = async (id: number) => {
        console.log('DB 삭제 요청:', id);
        if (!id) {
            console.error('삭제할 ID가 없습니다.');
            showMessage('삭제할 ID가 없습니다.', 'error');
            return;
        }

        try {

            await axios.delete(`${API_URL}/api/calendar/${id}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            showMessage('Event has been deleted.', 'success');
            fetchEvents();
        
        } catch (err) {
            console.error('DB 삭제 실패:', err);
            showMessage('Event deletion failed.', 'error');
        }
    };
    const getMonth = (dt: Date, add: number = 0) => {
        let month = dt.getMonth() + 1 + add;
        const str = (month < 10 ? '0' + month : month).toString();
        return str;
        // return dt.getMonth() < 10 ? '0' + month : month;
    };

    const [events, setEvents] = useState<any>([]); // 👉 초기는 빈 배열
         
    const [isAddEventModal, setIsAddEventModal] = useState(false);
    const [minStartDate, setMinStartDate] = useState<any>('');
    const [minEndDate, setMinEndDate] = useState<any>('');
    //const defaultParams = { id: null, title: '', start: getDefaultStartDateTime(), end: '', description: '', type: 'primary' };
    // const [params, setParams] = useState<any>(defaultParams);
     const [params, setParams] = useState({
       id: null,
       title: '',
       start: getDefaultStartDateTime(),
       end: getDefaultEndDateTime(),
       description: '',
       type: 'primary',
     });
   

    const dateFormat = (dt: any) => {
        dt = new Date(dt);
        const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
        const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
        const hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
        const mins = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
        dt = dt.getFullYear() + '-' + month + '-' + date + 'T' + hours + ':' + mins;
        return dt;
    };
    const editEvent = (data: any = null) => {
       // let params = JSON.parse(JSON.stringify(params));
        setParams(params);
        if (data) {
            let obj = JSON.parse(JSON.stringify(data.event));
            setParams({
                id: obj.id ? obj.id : null,
                title: obj.title ? obj.title : null,
                start: dateFormat(obj.start),
                end: dateFormat(obj.end),
                type: obj.classNames ? obj.classNames[0] : 'primary',
                description: obj.extendedProps ? obj.extendedProps.description : '',
            });
            setMinStartDate(new Date());
            setMinEndDate(dateFormat(obj.start));
        } else {
            setMinStartDate(new Date());
            setMinEndDate(new Date());
        }
        setIsAddEventModal(true);
    };
    const editDate = (data: any) => {
        let obj = {
            event: {
                start: data.start,
                end: data.end,
            },
        };
        editEvent(obj);
    };
    const validationCheck = () => {
        if (!params.title) {
            showMessage('Please enter the event title.', 'error');
            titleRef.current?.focus(); // 제목 input으로 커서 이동
            return false;
        }
        if (!params.start) {
            showMessage('Please select a start date/time.', 'error');
            startRef.current?.focus(); // 시작일 input으로 커서 이동
            return false;
        }
        if (!params.end) {
            showMessage('Please select an end date/time.', 'error');
            endRef.current?.focus(); // 종료일 input으로 커서 이동
            return false;
        }
        if (new Date(params.start) > new Date(params.end)) {
            showMessage('Start time cannot be later than end time.', 'error');
            startRef.current?.focus(); // 시작일 잘못됐으면 시작일로 커서 이동
            return false;
        }
        return true;
    };

    // ✨ 새로운 함수
    const user = useSelector((state: IRootState) => state.user); // ✅ Redux user 가져오기
    const role = useSelector((state) => user.role_code);
    const roleCheck = () => {
        console.log(user?.role_code);   
        if (user?.role_code !== 'admin') {
            showMessage('Only admin users can create or edit events.', 'error');
            return false;
        }
        return true;
    };

    const saveEvent = async () => {
        if (!validationCheck()) {
            return; // 🔥 validation 실패하면 저장 안 함
        }
        if (!roleCheck()) return;
    
        try {
            if (params.id) {
                // ✅ 기존 이벤트 수정 (Update)
                await axios.put(`${API_URL}/api/calendar/${params.id}`, {
                    title: params.title,
                    start: params.start,
                    end: params.end,
                    className: params.type,
                    description: params.description,
                });
    
                showMessage('Event has been updated.', 'success');
            } else {
                // ✅ 새 이벤트 추가 (Create)
                await axios.post(`${API_URL}/api/calendar`, {
                    title: params.title,
                    start: params.start,
                    end: params.end,
                    className: params.type,
                    description: params.description,
                });
    
                showMessage('Event has been created.', 'success');
            }
    
            // 🔥 저장 후 일정 새로 불러오기
            await new Promise(resolve => setTimeout(resolve, 100));
            fetchEvents();
    
            setIsAddEventModal(false);
    
        } catch (err) {
            console.error('DB 저장 실패:', err);
            showMessage('Event saving failed.', 'error');
        }
    };
    
    const startDateChange = (event: any) => {
        const dateStr = event.target.value;
        if (dateStr) {
            setMinEndDate(dateStr);
            setParams({
                ...params,
                start: dateStr,
                end: params.end || dateStr, // ✅ end가 비었으면 start랑 똑같이 설정
            });
        }
    };
    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };
    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div>
            <div className="panel mb-5">
                <div className="mb-4 flex items-center sm:flex-row flex-col sm:justify-between justify-center">
                    <div className="sm:mb-0 mb-4">
                        <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">Calendar</div>
                        <div className="flex items-center mt-2 flex-wrap sm:justify-start justify-center">
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-fuchsia-500"></div>
                                <div>프론트엔드</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-info"></div>
                                <div>데이터베이스</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-blue-500"></div>
                                <div>서버구축</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-red-500"></div>
                                <div>Cloud </div>
                            </div>
                           
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-orange-400"></div>       
                                <div>면접특강</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-amber-400"></div>
                                <div>커리어특강</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-lime-400"></div>
                                <div>2D</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-green-400"></div>
                                <div>3D </div>
                            </div>
                           
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-cyan-400"></div>       
                                <div>수료식</div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-rose-500"></div>
                                <div>OT </div>
                            </div>
                            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-violet-500"></div>
                                <div>취업특강 </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => editEvent()}>
                        <IconPlus className="ltr:mr-2 rtl:ml-2" />
                        Create Event
                    </button>
                    
                </div>
                <div className="calendar-wrapper">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                        editable={true}
                        dayMaxEvents={true}
                        selectable={true}
                        droppable={true}
                        eventClick={(event: any) => editEvent(event)}
                        select={(event: any) => editDate(event)}
                        events={events}
                    />
                </div>
            </div>

            {/* add event modal */}
            <Transition appear show={isAddEventModal} as={Fragment}>
                <Dialog as="div" onClose={() => setIsAddEventModal(false)} open={isAddEventModal} className="relative z-[51]">
                    <Transition.Child
                        as={Fragment}
                        enter="duration-300 ease-out"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="duration-300 ease-out"
                                enter-from="opacity-0 scale-95"
                                enter-to="opacity-100 scale-100"
                                leave="duration-200 ease-in"
                                leave-from="opacity-100 scale-100"
                                leave-to="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        onClick={() => setIsAddEventModal(false)}
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.id ? 'Edit Event' : 'Add Event'}
                                    </div>
                                    <div className="p-5">
                                        <form className="space-y-5">
                                            <div>
                                                <label htmlFor="title">Event Title :</label>
                                                <input
                                                  ref={titleRef}
                                                    id="title"
                                                    type="text"
                                                    name="title"
                                                    className="form-input"
                                                    placeholder="Enter Event Title"
                                                    value={params.title || ''}
                                                    onChange={(e) => changeValue(e)}
                                                    required
                                                />
                                                <div className="text-danger mt-2" id="titleErr"></div>
                                            </div>

                                            <div>
                                                <label htmlFor="dateStart">From :</label>
                                                <input
                                                  ref={startRef}
                                                    id="start"
                                                    type="datetime-local"
                                                    name="start"
                                                    className="form-input"
                                                    placeholder="Event Start Date"
                                                    value={params.start}
                                                    min={minStartDate}
                                                    onChange={(event: any) => startDateChange(event)}
                                                    required
                                                />
                                                <div className="text-danger mt-2" id="startDateErr"></div>
                                            </div>
                                            <div>
                                                <label htmlFor="dateEnd">To :</label>
                                                <input
                                                 ref={endRef}
                                                    id="end"
                                                    type="datetime-local"
                                                    name="end"
                                                    className="form-input"
                                                    placeholder="Event End Date"
                                                    value={params.end || ''}
                                                    min={minEndDate}
                                                    onChange={(e) => changeValue(e)}
                                                    required
                                                />
                                                <div className="text-danger mt-2" id="endDateErr"></div>
                                            </div>
                                            <div>
                                                <label htmlFor="description">Event Description :</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    className="form-textarea min-h-[130px]"
                                                    placeholder="Enter Event Description"
                                                    value={params.description || ''}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                            </div>
                                            <div>
                                                {/* <label>Badge:</label> */}
                                                <div className="mt-3">
                                               
                                                    <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                        <input
                                                    type="radio"
                                                    className="form-radio text-front"
                                                    name="type"
                                                    value="frontend"
                                                    checked={params.type === 'frontend'}
                                                    onChange={(e) => setParams({ ...params, type: e.target.value })}
                                                    />

                                                        <span className="ltr:pl-2 rtl:pr-2">프론트엔드</span>
                                                    </label>
                                                     <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-database"
                                                            name="type"
                                                            value="database"
                                                            checked={params.type === 'database'}
                                                            onChange={(e) => setParams({ ...params, type: e.target.value })}
                                                        />
                                                        <span className="ltr:pl-2 rtl:pr-2">데이터베이스</span>
                                                    </label> 
                                                    <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-server"
                                                            name="type"
                                                            value="server"
                                                            checked={params.type === 'server'}
                                                            onChange={(e) => setParams({ ...params, type: e.target.value })}
                                                        />
                                                        <span className="ltr:pl-2 rtl:pr-2">서버구축</span>
                                                    </label>
                                                    <label className="inline-flex cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-cloud"
                                                            name="type"
                                                            value="cloud"
                                                            checked={params.type === 'cloud'}
                                                            onChange={(e) => setParams({ ...params, type: e.target.value })}
                                                        />
                                                        <span className="ltr:pl-2 rtl:pr-2">클라우드</span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end items-center mt-8 space-x-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEventModal(false)}>
                                                    Cancel
                                                </button>
                                                
                                                {params.id && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    // onClick={() => deleteEvent(params.id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                                <button type="button" onClick={() => saveEvent()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {params.id ? 'Update Event' : 'Create Event'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Calendar;
