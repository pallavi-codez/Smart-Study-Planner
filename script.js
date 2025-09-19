document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const tasksList = document.getElementById('tasks-list');
    const noTasksMessage = document.getElementById('no-tasks-message');
    const totalTasksCount = document.getElementById('total-tasks-count');
    const completedTasksCount = document.getElementById('completed-tasks-count');
    const pendingTasksCount = document.getElementById('pending-tasks-count');
    const totalTaskInfo = document.getElementById('total-task-info');
    const storageKey = 'study_planner_tasks';
    
    // --- Local Storage Functions ---
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        return tasks.sort((a, b) => {
            const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityComparison !== 0) {
                return priorityComparison;
            }
            return new Date(a.deadline) - new Date(b.deadline);
        });
    };

    const saveTasks = (tasks) => {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    };

    // --- UI Rendering and Status Update ---
    const updateStatusCounters = (tasks) => {
        totalTasksCount.textContent = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        completedTasksCount.textContent = completed;
        pendingTasksCount.textContent = tasks.length - completed;
    };

    const renderTasks = () => {
        const tasks = loadTasks();
        tasksList.innerHTML = '';
        if (tasks.length === 0) {
            noTasksMessage.classList.remove('hidden');
        } else {
            noTasksMessage.classList.add('hidden');
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                const priorityColors = {
                    low: 'bg-green-600',
                    medium: 'bg-yellow-600',
                    high: 'bg-red-600'
                };
                const isPastDue = !task.completed && new Date(task.deadline) < new Date();
                const pastDueClass = isPastDue ? 'bg-red-900 border-red-500 border' : '';
                
                taskElement.innerHTML = `
                    <div class="flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-200
                        ${task.completed ? 'bg-slate-700 opacity-60' : 'bg-slate-700'} ${pastDueClass}">
                        <div class="flex-grow">
                            <h3 class="text-lg font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}">${task.taskTopic}</h3>
                            <p class="text-sm text-slate-400">Subject: ${task.subject}</p>
                            <p class="text-sm text-slate-400">Category: ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
                            <p class="text-sm text-slate-400">Due: ${task.deadline}</p>
                            <p class="text-sm text-slate-400">Added: ${task.addedAt}</p>
                            <span class="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full text-white
                                ${priorityColors[task.priority]}">
                                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </span>
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button class="complete-btn bg-green-500 hover:bg-green-600 text-white rounded-full p-2" data-id="${task.id}" title="Mark as Completed">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </button>
                            <button class="delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-2" data-id="${task.id}" title="Delete Task">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                tasksList.appendChild(taskElement.firstElementChild);
            });
        }
        updateStatusCounters(tasks);
    };

    // Add a new task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(taskForm);
        const newTask = {
            id: Date.now(),
            subject: formData.get('subject'),
            category: formData.get('category'),
            taskTopic: formData.get('taskTopic'),
            deadline: formData.get('deadline'),
            priority: formData.get('priority'),
            completed: false,
            addedAt: new Date().toLocaleString()
        };

        const tasks = loadTasks();
        tasks.push(newTask);
        saveTasks(tasks);
        renderTasks();
        taskForm.reset();
    });

    // Handle task button clicks (complete and delete)
    tasksList.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;

        const id = parseInt(targetBtn.dataset.id);
        let tasks = loadTasks();

        if (targetBtn.classList.contains('complete-btn')) {
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
            }
        } else if (targetBtn.classList.contains('delete-btn')) {
            tasks = tasks.filter(task => task.id !== id);
        }
        
        saveTasks(tasks);
        renderTasks();
    });

    // Initial render
    renderTasks();
});
