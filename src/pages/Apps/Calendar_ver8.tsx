import { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import Swal from 'sweetalert2';
import axios from 'axios';

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

const getEventColor = (type) => {
  switch (type) {
    case 'frontend': return '#3b82f6';
    case 'database': return '#38bdf8';
    case 'server': return '#10b981';
    case 'cloud': return '#f59e0b';
    case 'career': return '#ef4444';
    case 'interview': return '#8b5cf6';
    case 'special': return '#1e40af';
    case '2dproject': return '#f472b6';
    case '3dproject': return '#78350f';
    case 'ot': return '#facc15';
    case 'graduation': return '#c084fc';
    default: return '#64748b';
  }
};

const CalendarPage = () => {
  const titleRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [isAddEventModal, setIsAddEventModal] = useState(false);
  const [params, setParams] = useState({
    id: null,
    title: '',
    start: getDefaultStartDateTime(),
    end: getDefaultEndDateTime(),
    description: '',
    type: 'frontend',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/calendar');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const showMessage = (msg, type) => {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: type,
      title: msg,
      showConfirmButton: false,
      timer: 3000,
    });
  };

  const validationCheck = () => {
    if (!params.title) {
      showMessage('Please enter the event title.', 'error');
      titleRef.current?.focus();
      return false;
    }
    if (!params.start) {
      showMessage('Please select a start date/time.', 'error');
      startRef.current?.focus();
      return false;
    }
    if (!params.end) {
      showMessage('Please select an end date/time.', 'error');
      endRef.current?.focus();
      return false;
    }
    if (new Date(params.start) > new Date(params.end)) {
      showMessage('Start time cannot be after end time.', 'error');
      startRef.current?.focus();
      return false;
    }
    return true;
  };

  const saveEvent = async () => {
    if (!validationCheck()) return;

    try {
      if (params.id) {
        await axios.put(`http://localhost:5000/api/calendar/${params.id}`, {
          ...params,
          color: getEventColor(params.type),
        });
        showMessage('Event updated.', 'success');
      } else {
        await axios.post('http://localhost:5000/api/calendar', {
          ...params,
          color: getEventColor(params.type),
        });
        showMessage('Event created.', 'success');
      }
      await fetchEvents();
      setIsAddEventModal(false);
    } catch (err) {
      console.error('Failed to save event:', err);
      showMessage('Event saving failed.', 'error');
    }
  };

  const editEvent = (info) => {
    const event = info.event || info;
    setParams({
      id: event.id || null,
      title: event.title || '',
      start: event.start ? new Date(event.start).toISOString().slice(0, 16) : getDefaultStartDateTime(),
      end: event.end ? new Date(event.end).toISOString().slice(0, 16) : getDefaultEndDateTime(),
      description: event.extendedProps?.description || '',
      type: event.classNames?.[0] || 'frontend',
    });
    setIsAddEventModal(true);
  };

  const changeValue = (e) => {
    const { id, value } = e.target;
    setParams((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        dayHeaderFormat={{ weekday: 'short' }}
        events={events}
        editable
        selectable
        select={editEvent}
        eventClick={editEvent}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
      />

      <Transition appear show={isAddEventModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddEventModal(false)}>
          <div className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
              <Dialog.Title className="text-lg font-bold mb-4">{params.id ? 'Edit' : 'Add'} Event</Dialog.Title>
              <form className="space-y-4">
                <input ref={titleRef} id="title" type="text" className="form-input w-full" placeholder="Title" value={params.title} onChange={changeValue} />
                <input ref={startRef} id="start" type="datetime-local" className="form-input w-full" value={params.start} onChange={changeValue} />
                <input ref={endRef} id="end" type="datetime-local" className="form-input w-full" value={params.end} onChange={changeValue} />
                <textarea id="description" className="form-textarea w-full" placeholder="Description" value={params.description} onChange={changeValue}></textarea>
                <select id="type" className="form-select w-full" value={params.type} onChange={changeValue}>
                  <option value="frontend">프론트엔드개발</option>
                  <option value="database">데이터베이스설계및구축</option>
                  <option value="server">서버구축</option>
                  <option value="cloud">클라우드기반인프라구축</option>
                  <option value="career">취업특강</option>
                  <option value="interview">면접특강</option>
                  <option value="special">커리어특강</option>
                  <option value="2dproject">2D프로젝트</option>
                  <option value="3dproject">3D프로젝트</option>
                  <option value="ot">OT</option>
                  <option value="graduation">수료식</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button type="button" className="btn btn-outline" onClick={() => setIsAddEventModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={saveEvent}>{params.id ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CalendarPage;