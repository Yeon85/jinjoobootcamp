import { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';
import axios from 'axios';
import koLocale from '@fullcalendar/core/locales/ko';

function getDefaultStartDateTime() {
  const now = new Date();
  now.setHours(8, 30, 0, 0); // 08:30
  return now.toISOString().slice(0, 16);
}

function getDefaultEndDateTime() {
  const now = new Date();
  now.setHours(17, 30, 0, 0); // 17:30
  return now.toISOString().slice(0, 16);
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const CalendarPage = () => {
  const titleRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [isAddEventModal, setIsAddEventModal] = useState(false);
  const [categories, setCategories] = useState([]);

  const [params, setParams] = useState({
    id: null,
    title: '',
    start: getDefaultStartDateTime(),
    end: getDefaultEndDateTime(),
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/common/category');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const mapCategoryToClassName = (category) => {
    switch (category) {
      case '프론트엔드개발': return 'frontend';
      case '데이터베이스설계및구축': return 'database';
      case '서버구축': return 'server';
      case '클라우드기반인프라구축': return 'cloud';
      case '취업특강': return 'employment';
      case '면접특강': return 'interview';
      case '커리어특강': return 'career';
      case '2D프로젝트': return 'project2d';
      case '3D프로젝트': return 'project3d';
      case 'OT': return 'ot';
      case '수료식': return 'graduation';
      default: return 'default';
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/calendar');
      const mappedEvents = res.data.map((event) => ({
        ...event,
        className: mapCategoryToClassName(event.category),
      }));
      setEvents(mappedEvents);
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
        await axios.put(`http://localhost:5000/api/calendar/${params.id}`, params);
        showMessage('Event updated.', 'success');
      } else {
        await axios.post('http://localhost:5000/api/calendar', params);
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
      start: event.start ? formatDateTimeLocal(new Date(event.start)) : getDefaultStartDateTime(),
      end: event.end ? formatDateTimeLocal(new Date(event.end)) : getDefaultEndDateTime(),
      category: event.extendedProps?.category || '',
      description: event.extendedProps?.description || '',
    });
    setIsAddEventModal(true);
  };

  const changeValue = (e) => {
    const { id, value } = e.target;
    setParams((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-4">
      <button className="btn btn-primary mb-4" onClick={() => setIsAddEventModal(true)}>Add Event</button>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
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
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        locale={koLocale}
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
                <select id="category" className="form-select w-full" value={params.category} onChange={changeValue}>
                  <option value="">-- 카테고리 선택 --</option>
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>{cat.label}</option>
                  ))}
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