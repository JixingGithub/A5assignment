document.addEventListener('DOMContentLoaded', () => {
    // Store tasks globally
    window.tasks = {};

    // Get current date information
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Date formatting code
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const formattedDate = `${month}/${day}/${year}`;

    // Initialize tasks object with empty array for today
    window.tasks = {
        [formattedDate]: [] // Initialize with empty array for today
    };

    // Update date display
    const currentDateElement = document.querySelector('.current-date');
    currentDateElement.textContent = formattedDate;

    // Update month title
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.querySelector('.month-view h2').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Get days in a month
    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Generate calendar grid
    function generateCalendarGrid() {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const calendarGrid = document.querySelector('.calendar-grid');
        calendarGrid.innerHTML = '';

        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';

            if (day < now.getDate() && currentMonth === now.getMonth()) {
                dayElement.classList.add('past');
            }

            const dateNumber = document.createElement('span');
            dateNumber.className = 'date-number';
            dateNumber.textContent = day;

            const taskBlocks = document.createElement('div');
            taskBlocks.className = 'task-blocks';

            dayElement.appendChild(dateNumber);
            dayElement.appendChild(taskBlocks);
            calendarGrid.appendChild(dayElement);
        }
    }

    // Function to update today's tasks
    function updateTodayTasks() {
        const taskListElement = document.querySelector('.task-list');
        if (!taskListElement) return;

        taskListElement.innerHTML = '';
        const todaysTasks = window.tasks[formattedDate] || [];

        if (todaysTasks.length > 0) {
            todaysTasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task');

                const categorySpan = document.createElement('span');
                categorySpan.classList.add('task-category');
                categorySpan.style.backgroundColor = task.color;
                categorySpan.textContent = task.text;

                taskDiv.appendChild(categorySpan);
                taskListElement.appendChild(taskDiv);
            });
        } else {
            taskListElement.textContent = 'Nothing to do';
        }
    }
    //Check Today
    function isToday(dateKey) {
        const today = new Date();
        const [m, d, y] = dateKey.split('/');
        return parseInt(m) === today.getMonth() + 1 &&
            parseInt(d) === today.getDate() &&
            parseInt('20' + y) === today.getFullYear();
    }

    // Function to update upcoming tasks
    function updateUpcomingTasks() {
        const upcomingList = document.querySelector('.upcoming-list');
        if (!upcomingList) return;

        upcomingList.innerHTML = '';

        const nowDate = new Date();
        nowDate.setHours(0, 0, 0, 0);
        const sortedTasks = [];

        for (const dateKey in window.tasks) {
            const [m, d, y] = dateKey.split('/');
            const date = new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(d));
            date.setHours(0, 0, 0, 0);

            if (date > nowDate) { // Changed from >= to > to exclude today
                window.tasks[dateKey].forEach(task => {
                    sortedTasks.push({
                        date: date,
                        dateKey: dateKey,
                        text: task.text,
                        color: task.color
                    });
                });
            }
        }

        sortedTasks.sort((a, b) => a.date - b.date);
        const uniqueDates = [...new Set(sortedTasks.map(t => t.dateKey))].slice(0, 3);

        uniqueDates.forEach(dateKey => {
            const dateTasks = sortedTasks.filter(t => t.dateKey === dateKey);
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'event-date';
            dateSpan.textContent = dateKey + ': ';

            const descSpan = document.createElement('span');
            descSpan.className = 'event-desc';

            dateTasks.forEach(task => {
                const taskSpan = document.createElement('span');
                taskSpan.className = 'task-category';
                taskSpan.textContent = task.text;
                taskSpan.style.backgroundColor = task.color;
                descSpan.appendChild(taskSpan);
            });

            eventDiv.appendChild(dateSpan);
            eventDiv.appendChild(descSpan);
            upcomingList.appendChild(eventDiv);
        });
    }

    // Initialize grid
    generateCalendarGrid();

    // Set up calendar day click handlers
    const calendarDays = document.querySelectorAll('.day');
    calendarDays.forEach(day => {
        if (!day.classList.contains('past') && !day.classList.contains('empty')) {
            day.addEventListener('click', function(e) {
                e.preventDefault();

                const rect = this.getBoundingClientRect();
                const existingPopup = document.querySelector('.task-entry-popup');
                if (existingPopup) {
                    existingPopup.remove();
                }

                const popup = document.createElement('div');
                popup.className = 'task-entry-popup';
                popup.style.position = 'absolute';
                popup.style.left = `${rect.right + 10}px`;
                popup.style.top = `${rect.top}px`;

                popup.innerHTML = `
                    <div class="bg-white p-4 rounded shadow-lg">
                        <input type="text" class="task-input" placeholder="Enter task...">
                        <div class="color-picker mt-2">
                            <button data-color="#4a90e2" style="background: #4a90e2"></button>
                            <button data-color="#9b59b6" style="background: #9b59b6"></button>
                            <button data-color="#27ae60" style="background: #27ae60"></button>
                            <button data-color="#e74c3c" style="background: #e74c3c"></button>
                        </div>
                        <button class="add-btn mt-2">Add Task</button>
                    </div>
                `;

                document.body.appendChild(popup);
                popup.querySelector('.task-input').focus();

                let selectedColor = '#4a90e2';

                popup.querySelector('.color-picker').addEventListener('click', (e) => {
                    if (e.target.dataset.color) {
                        selectedColor = e.target.dataset.color;
                        popup.querySelectorAll('.color-picker button').forEach(btn => {
                            btn.style.border = btn.dataset.color === selectedColor ? '2px solid #000' : 'none';
                        });
                    }
                });

                popup.querySelector('.add-btn').addEventListener('click', () => {
                    const taskText = popup.querySelector('.task-input').value.trim();
                    if (taskText) {
                        const dateNumber = this.querySelector('.date-number').textContent;
                        const dateKey = `${month}/${dateNumber}/${year}`;

                        if (!window.tasks[dateKey]) {
                            window.tasks[dateKey] = [];
                        }

                        const newTask = {
                            text: taskText,
                            color: selectedColor
                        };
                        window.tasks[dateKey].push(newTask);

                        const taskBlock = document.createElement('div');
                        taskBlock.className = 'task-block';
                        taskBlock.textContent = taskText;
                        taskBlock.style.backgroundColor = selectedColor;

                        let taskBlocks = this.querySelector('.task-blocks');
                        if (!taskBlocks) {
                            taskBlocks = document.createElement('div');
                            taskBlocks.className = 'task-blocks';
                            this.appendChild(taskBlocks);
                        }

                        taskBlocks.appendChild(taskBlock);

                        // Check if the date is today
                        if (isToday(dateKey)) {
                            const todayTaskListElement = document.querySelector('.task-list');
                            if (todayTaskListElement) {
                                // Clear "Nothing to do" if it's there
                                if (todayTaskListElement.textContent === 'Nothing to do') {
                                    todayTaskListElement.innerHTML = '';
                                }

                                // Add the new task to Today's Tasks
                                const taskDiv = document.createElement('div');
                                taskDiv.classList.add('task');

                                const categorySpan = document.createElement('span');
                                categorySpan.classList.add('task-category');
                                categorySpan.style.backgroundColor = selectedColor;
                                categorySpan.textContent = taskText;

                                taskDiv.appendChild(categorySpan);
                                todayTaskListElement.appendChild(taskDiv);
                            }
                        }

                        updateUpcomingTasks();
                        popup.remove();
                    }
                });
            });
        }
    });

    // Click outside handler
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.task-entry-popup') && !e.target.closest('.day')) {
            const popup = document.querySelector('.task-entry-popup');
            if (popup) popup.remove();
        }
    });

    // Initial updates
    updateTodayTasks();
    updateUpcomingTasks();
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}