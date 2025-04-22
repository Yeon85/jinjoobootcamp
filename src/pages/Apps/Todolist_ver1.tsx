// Todolist.tsx 수정 버전
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Task {
  id: number;
  title: string;
  assignee: string;
  tag: string;
  priority: string;
  description: string;
}

const Todolist = () => {
  const defaultParams: Task = {
    id: 0,
    title: '',
    assignee: '',
    tag: '',
    priority: 'low',
    description: '',
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [params, setParams] = useState<Task>(defaultParams);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);

  const addTask = () => {
    setParams({ ...defaultParams });
    setIsAddTaskModalOpen(true);
  };

  const viewTask = (task: Task) => {
    setSelectedTask(task);
    setIsViewTaskModalOpen(true);
  };

  const saveTask = () => {
    if (!params.title) return;

    const newTask: Task = {
      ...params,
      id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    };
    setTasks([...tasks, newTask]);
    setIsAddTaskModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <button className="btn btn-primary" onClick={addTask}>Add New Task</button>
      </div>

      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className="p-4 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
            onClick={() => viewTask(task)}
          >
            {task.title}
          </li>
        ))}
      </ul>

      {/* Add Task Modal */}
      <Transition appear show={isAddTaskModalOpen} as={Fragment}>
        <Dialog as="div" onClose={() => setIsAddTaskModalOpen(false)} className="relative z-10">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
                  <Dialog.Title className="text-lg font-bold">Add Task</Dialog.Title>
                  <div className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Title"
                      className="form-input w-full"
                      value={params.title}
                      onChange={(e) => setParams({ ...params, title: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Assignee"
                      className="form-input w-full"
                      value={params.assignee}
                      onChange={(e) => setParams({ ...params, assignee: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Tag"
                      className="form-input w-full"
                      value={params.tag}
                      onChange={(e) => setParams({ ...params, tag: e.target.value })}
                    />
                    <select
                      className="form-select w-full"
                      value={params.priority}
                      onChange={(e) => setParams({ ...params, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ReactQuill
                      theme="snow"
                      value={params.description}
                      onChange={(content) => setParams({ ...params, description: content })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-outline" onClick={() => setIsAddTaskModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveTask}>Add</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* View Task Modal */}
      {selectedTask && (
        <Transition appear show={isViewTaskModalOpen} as={Fragment}>
          <Dialog as="div" onClose={() => setIsViewTaskModalOpen(false)} className="relative z-10">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
                    <Dialog.Title className="text-lg font-bold">{selectedTask.title}</Dialog.Title>
                    <div className="mt-4 prose" dangerouslySetInnerHTML={{ __html: selectedTask.description }} />
                    <div className="flex justify-end mt-6">
                      <button className="btn btn-outline-danger" onClick={() => setIsViewTaskModalOpen(false)}>Close</button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default Todolist;
