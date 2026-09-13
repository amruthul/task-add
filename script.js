document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Fetch and display initial tasks
    fetchTasks();

    // Add new task
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = todoInput.value.trim();
        if (!title) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            });

            if (response.ok) {
                const newTask = await response.json();
                renderTask(newTask);
                todoInput.value = '';
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    });

    // Fetch all tasks from backend
    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            todoList.innerHTML = '';
            tasks.forEach(renderTask);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Render a single task to the DOM
    function renderTask(task) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="todo-content" onclick="toggleTask('${task.id}')">
                <div class="checkbox"></div>
                <span class="task-title">${escapeHTML(task.title)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Delete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;
        todoList.appendChild(li);
    }

    // Toggle task completion status
    window.toggleTask = async (id) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT'
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const taskElement = document.querySelector(`li[data-id="${id}"]`);
                if (taskElement) {
                    if (updatedTask.completed) {
                        taskElement.classList.add('completed');
                    } else {
                        taskElement.classList.remove('completed');
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    // Delete a task
    window.deleteTask = async (id) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const taskElement = document.querySelector(`li[data-id="${id}"]`);
                if (taskElement) {
                    // Add fade out animation
                    taskElement.style.opacity = '0';
                    taskElement.style.transform = 'translateY(10px)';
                    taskElement.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        taskElement.remove();
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Utility to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
});
