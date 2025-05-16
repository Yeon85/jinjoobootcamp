// 📁 src/pages/Wbs.tsx

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPlus from '../../components/Icon/IconPlus';
import IconX from '../../components/Icon/IconX';
import axios from 'axios';
import { IRootState } from '../../store';
import ApplicationConfig from '../../application';
import Swal from 'sweetalert2';

const Wbs = () => {
    const dispatch = useDispatch();
    const titleRef = useRef<HTMLInputElement>(null);
    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);
    const managerRef = useRef<HTMLInputElement>(null);

    const API_URL = ApplicationConfig.API_URL;

    const user = useSelector((state: IRootState) => state.user);

    const [events, setEvents] = useState<any>([]);
    const [isAddEventModal, setIsAddEventModal] = useState(false);
    const [params, setParams] = useState<any>({
        id: null,
        title: '',
        start: '',
        end: '',
        manager: '',
        description: '',
        type: 'project',
    });

    useEffect(() => {
        dispatch(setPageTitle('WBS 관리'));
        fetchEvents();
    }, [dispatch]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/wbs`);
            setEvents(res.data);
        } catch (err) {
            console.error('업무 목록 불러오기 실패:', err);
        }
    };

    const validationCheck = () => {
        if (!params.title) {
            showMessage('업무명을 입력하세요.', 'error');
            titleRef.current?.focus();
            return false;
        }
        if (!params.manager) {
            showMessage('담당자를 입력하세요.', 'error');
            managerRef.current?.focus();
            return false;
        }
        if (!params.start) {
            showMessage('시작일을 선택하세요.', 'error');
            startRef.current?.focus();
            return false;
        }
        if (!params.end) {
            showMessage('종료일을 선택하세요.', 'error');
            endRef.current?.focus();
            return false;
        }
        if (new Date(params.start) > new Date(params.end)) {
            showMessage('시작일은 종료일보다 빠를 수 없습니다.', 'error');
            startRef.current?.focus();
            return false;
        }
        return true;
    };

    const showMessage = (msg = '', type = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top',
            timer: 2500,
            icon: 'success', // 또는 'error', 'info', 'warning'
            title: '메시지 텍스트',
            showConfirmButton: false,
          });
    };

    const saveEvent = async () => {
        if (!validationCheck()) return;

        try {
            if (params.id) {
                await axios.put(`${API_URL}/api/wbs/${params.id}`, params);
                showMessage('업무가 수정되었습니다.', 'success');
            } else {
                await axios.post(`${API_URL}/api/wbs`, params);
                showMessage('업무가 생성되었습니다.', 'success');
            }
            setIsAddEventModal(false);
            fetchEvents();
        } catch (err) {
            console.error('업무 저장 실패:', err);
            showMessage('저장 실패', 'error');
        }
    };

    const editEvent = (info: any) => {
        const { id, title, start, end, extendedProps } = info.event;
        setParams({
            id,
            title,
            start,
            end,
            manager: extendedProps.manager || '',
            description: extendedProps.description || '',
            type: 'project',
        });
        setIsAddEventModal(true);
    };

    const selectDate = (selection: any) => {
        setParams({
            id: null,
            title: '',
            start: selection.startStr,
            end: selection.endStr,
            manager: '',
            description: '',
            type: 'project',
        });
        setIsAddEventModal(true);
    };

    return (
        <div>
            <div className="panel mb-5">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold">📋 WBS 업무 관리</h2>
                    <button onClick={() => setIsAddEventModal(true)} className="btn btn-primary">
                        <IconPlus className="mr-2" /> 업무 추가
                    </button>
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                    selectable={true}
                    editable={true}
                    events={events}
                    eventClick={editEvent}
                    select={selectDate}
                />
            </div>

            <Transition appear show={isAddEventModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsAddEventModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                                    <Dialog.Title className="text-lg font-bold">{params.id ? '업무 수정' : '업무 생성'}</Dialog.Title>
                                    <div className="mt-2 space-y-4">
                                        <input ref={titleRef} type="text" className="form-input w-full" placeholder="업무명" value={params.title} onChange={(e) => setParams({ ...params, title: e.target.value })} />
                                        <input ref={managerRef} type="text" className="form-input w-full" placeholder="담당자" value={params.manager} onChange={(e) => setParams({ ...params, manager: e.target.value })} />
                                        <input ref={startRef} type="datetime-local" className="form-input w-full" value={params.start} onChange={(e) => setParams({ ...params, start: e.target.value })} />
                                        <input ref={endRef} type="datetime-local" className="form-input w-full" value={params.end} onChange={(e) => setParams({ ...params, end: e.target.value })} />
                                        <textarea className="form-textarea w-full" placeholder="업무 설명" value={params.description} onChange={(e) => setParams({ ...params, description: e.target.value })}></textarea>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button onClick={() => setIsAddEventModal(false)} className="btn btn-outline-danger">
                                            취소
                                        </button>
                                        <button onClick={saveEvent} className="btn btn-primary">
                                            저장
                                        </button>
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

export default Wbs;
