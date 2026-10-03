import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { taskApi } from '../../services/taskApi';
import { Task } from '../../types';
import { LevelBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  CheckSquare,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue'>('ALL');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await taskApi.createTask({
        title: newTitle.trim(),
        deadline: newDeadline.trim() || undefined,
        priority: newPriority,
        status: 'Pending',
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewDeadline('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === 'Completed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B8FF3D', '#35E0A1', '#55B8FF'],
        });
      }
      await taskApi.updateTask(taskId, { status: newStatus as any });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Extracted Notice Action Items</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Action Taskboard
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs tracking-wide transition shadow-glow-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 font-mono text-xs">
        {['ALL', 'Pending', 'In Progress', 'Completed', 'Overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === tab
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted">Loading Task Engine...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-panel border border-white/10 space-y-3">
          <CheckSquare className="w-12 h-12 text-muted mx-auto opacity-50" />
          <h3 className="font-display font-bold text-lg text-white">No tasks in this view</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You can create a custom task or extract actions from any notice on the notice analysis page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col justify-between space-y-4 ${
                  isCompleted
                    ? 'border-white/5 bg-surface/40 opacity-70'
                    : 'border-white/10 hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <LevelBadge level={task.risk_level || 'LOW'} />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10">
                      Risk: {task.risk_score}/100
                    </span>
                  </div>

                  <h3 className={`font-display font-bold text-base text-white ${isCompleted ? 'line-through text-muted' : ''}`}>
                    {task.title}
                  </h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted">
                    <span className="flex items-center gap-1.5 text-warning">
                      <Clock className="w-3.5 h-3.5" />
                      {task.deadline || 'No deadline set'}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-2 py-1 rounded bg-surface border border-white/10 text-[11px] text-white focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {task.notice_id ? (
                      <Link
                        to={`/notices/${task.notice_id}`}
                        className="text-xs text-primary hover:underline font-mono"
                      >
                        Linked Notice →
                      </Link>
                    ) : (
                      <span className="text-[10px] font-mono text-muted">Personal Task</span>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-critical hover:bg-white/5 transition"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Action Task"
        subtitle="Create an actionable reminder with deadline risk calculation"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Task Title / Action</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Carry college ID for internal exam"
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-muted block mb-1.5">Deadline</label>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="e.g. Monday, 10 Oct"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted block mb-1.5">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs transition shadow-glow-primary"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
