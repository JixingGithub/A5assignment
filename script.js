document.addEventListener('DOMContentLoaded', () => {
   //CLOCK feature
    const clockElement = document.querySelector('.clock-time');

    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${h}:${m}:${s}`;
    }

    updateClock(); // Set initial time
    setInterval(updateClock, 1000); // Update every second

    // Store tasks globally
    window.tasks = {};

    // Get current date information
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Date formatting code
    const month = String(currentMonth + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const formattedDate = `${month}/${day}/${year}`;

    // Initialize tasks object with empty array for today
    window.tasks = {
        [formattedDate]: [

        ]
    };

    // Update date display
    const currentDateElement = document.querySelector('.current-date');
    currentDateElement.textContent = formattedDate;

    // Update month title
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.querySelector('.month-view h2').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Get days in a month
    function getDaysInMonth(m, y) {
        return new Date(y, m + 1, 0).getDate();
    }

    // Generate calendar grid with data-date attributes
    function generateCalendarGrid() {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const calendarGrid = document.querySelector('.calendar-grid');
        calendarGrid.innerHTML = '';

        // Optional: If you want to show leading empty days (from the previous month),
        // you can uncomment this. Currently, it's not in your original code:
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';

            // Mark past days of the current month as 'past'
            if (d < now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
                dayElement.classList.add('past');
            }

            const dateNumber = document.createElement('span');
            dateNumber.className = 'date-number';
            dateNumber.textContent = d;

            const taskBlocks = document.createElement('div');
            taskBlocks.className = 'task-blocks';

            // Create a dateKey in MM/DD/YY format for each day
            const dayStr = String(d).padStart(2, '0');
            const dateKey = `${month}/${dayStr}/${year}`;
            dayElement.dataset.date = dateKey; // Assign the date key to the dataset

            dayElement.appendChild(dateNumber);
            dayElement.appendChild(taskBlocks);
            calendarGrid.appendChild(dayElement);
        }
    }

    generateCalendarGrid();

    // Check if a given dateKey is today
    function isToday(dateKey) {
        const today = new Date();
        const [m, d, y] = dateKey.split('/');
        return parseInt(m) === (today.getMonth() + 1) &&
            parseInt(d) === today.getDate() &&
            parseInt('20' + y) === today.getFullYear();
    }

    // Function to update today's tasks section
        function updateTodayTasks() {
            const taskListElement = document.querySelector('.task-list');
            if (!taskListElement) return;
            taskListElement.innerHTML = '';

            const todaysTasks = window.tasks[formattedDate] || [];

            if (todaysTasks.length > 0) {
                todaysTasks.forEach((task, index) => {
                    const taskDiv = document.createElement('div');
                    taskDiv.classList.add('task');

                    const categorySpan = document.createElement('span');
                    categorySpan.classList.add('task-category');
                    categorySpan.style.backgroundColor = task.color;

                    // Truncate similarly as in the calendar:
                    let firstLine = task.text.split('\n')[0];
                    if (firstLine.length > 15) {
                        firstLine = firstLine.slice(0, 15) + '...';
                    }
                    categorySpan.textContent = firstLine;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-task-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        window.tasks[formattedDate].splice(index, 1);
                        if (window.tasks[formattedDate].length === 0) {
                            delete window.tasks[formattedDate];
                        }
                        const dayElement = document.querySelector(`.day[data-date="${formattedDate}"]`);
                        if (dayElement) updateTaskBlocks(dayElement, formattedDate);
                        updateTodayTasks();
                        updateUpcomingTasks();
                    };

                    categorySpan.onclick = () => {
                        showEditTaskForm(categorySpan, formattedDate, index);
                    };

                    taskDiv.appendChild(categorySpan);
                    taskDiv.appendChild(deleteBtn);
                    taskListElement.appendChild(taskDiv);
                });
            } else {
                taskListElement.textContent = 'Nothing to do';
            }
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

            if (date > nowDate) {
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

    // Update tasks displayed in a calendar day
    function updateTaskBlocks(dayElement, dateKey) {
        const taskBlocks = dayElement.querySelector('.task-blocks');
        taskBlocks.innerHTML = '';

        if (window.tasks[dateKey]) {
            window.tasks[dateKey].forEach(task => {
                const taskBlock = document.createElement('div');
                taskBlock.className = 'task-block';
                // Extract the first line of the task
                let firstLine = task.text.split('\n')[0];
                // Truncate to 15 characters if longer
                if (firstLine.length > 15) {
                    firstLine = firstLine.slice(0, 15) + '...';
                }
                taskBlock.textContent = firstLine;
                taskBlock.style.backgroundColor = task.color;
                taskBlocks.appendChild(taskBlock);
            });
        }
    }

    // Show edit form for an existing task
    function showEditTaskForm(taskElement, dateKey, taskIndex) {
        const rect = taskElement.getBoundingClientRect();
        const task = window.tasks[dateKey][taskIndex];

        const existingPopup = document.querySelector('.task-entry-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'task-entry-popup';
        popup.style.position = 'absolute';
        popup.style.left = `${rect.right + 10}px`;
        popup.style.top = `${rect.top}px`;

        popup.innerHTML = `
    <div class="bg-white p-4 rounded shadow-lg">
        <textarea class="task-input">${task.text}</textarea>
        <div class="color-picker mt-2">
            <button data-color="#4a90e2" style="background: #4a90e2"></button>
            <button data-color="#9b59b6" style="background: #9b59b6"></button>
            <button data-color="#27ae60" style="background: #27ae60"></button>
            <button data-color="#e74c3c" style="background: #e74c3c"></button>
        </div>
        <button class="save-btn mt-2">Save Changes</button>
        <button class="delete-btn mt-2">Delete Task</button>
    </div>
    `;

        document.body.appendChild(popup);

        const input = popup.querySelector('.task-input');
        // Auto-resize code
        const autoResize = () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        };
        input.addEventListener('input', autoResize);
        autoResize(); // Resize immediately to show full content

        input.focus();
        input.setSelectionRange(0, input.value.length);

        let selectedColor = task.color;
        // Highlight the currently selected color
        popup.querySelectorAll('.color-picker button').forEach(btn => {
            if (btn.dataset.color === selectedColor) {
                btn.classList.add('selected');
            }
        });

        popup.querySelector('.color-picker').addEventListener('click', (e) => {
            if (e.target.dataset.color) {
                selectedColor = e.target.dataset.color;
                popup.querySelectorAll('.color-picker button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                e.target.classList.add('selected');
            }
        });

        popup.querySelector('.save-btn').addEventListener('click', () => {
            const newText = input.value.trim();
            if (newText) {
                window.tasks[dateKey][taskIndex] = {
                    text: newText,
                    color: selectedColor
                };

                const dayElement = document.querySelector(`.day[data-date="${dateKey}"]`);
                if (dayElement) updateTaskBlocks(dayElement, dateKey);
                if (isToday(dateKey)) {
                    updateTodayTasks();
                }
                updateUpcomingTasks();
                popup.remove();
            }
        });

        popup.querySelector('.delete-btn').addEventListener('click', () => {
            window.tasks[dateKey].splice(taskIndex, 1);
            if (window.tasks[dateKey].length === 0) {
                delete window.tasks[dateKey];
            }
            const dayElement = document.querySelector(`.day[data-date="${dateKey}"]`);
            if (dayElement) updateTaskBlocks(dayElement, dateKey);
            if (isToday(dateKey)) {
                updateTodayTasks();
            }
            updateUpcomingTasks();
            popup.remove();
        });
    }


    // Set up calendar day click handlers
    const calendarDays = document.querySelectorAll('.day');
    calendarDays.forEach(day => {
        if (!day.classList.contains('past') && !day.classList.contains('empty')) {
            day.addEventListener('click', function(e) {
                // If clicking on a task block, handle differently
                if (e.target.classList.contains('task-block')) {
                    e.stopPropagation();
                    const dateKey = this.dataset.date;
                    const taskIndex = Array.from(this.querySelector('.task-blocks').children).indexOf(e.target);
                    showEditTaskForm(e.target, dateKey, taskIndex);
                    return;
                }

                // Otherwise, show add-task popup
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
                    <textarea class="task-input" placeholder="Enter task..."></textarea>
                    <div class="color-picker mt-2">
                        <button data-color="#4a90e2" style="background: #4a90e2"></button>
                        <button data-color="#9b59b6" style="background: #9b59b6"></button>
                        <button data-color="#27ae60" style="background: #27ae60"></button>
                        <button data-color="#e74c3c" style="background: #e74c3c"></button>
                    </div>
                    <button class="add-btn mt-2">Add Task</button>
                </div>
                `;

                const textarea = popup.querySelector('.task-input');

                // auto-resize listener
                textarea.addEventListener('input', () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                });

                textarea.dispatchEvent(new Event('input'));

                document.body.appendChild(popup);
                popup.querySelector('.task-input').focus();

                let selectedColor = '#4a90e2';
                popup.querySelector('.color-picker').addEventListener('click', (event) => {
                    if (event.target.dataset.color) {
                        selectedColor = event.target.dataset.color;
                        popup.querySelectorAll('.color-picker button').forEach(btn => {
                            btn.style.border = btn.dataset.color === selectedColor ? '2px solid #000' : 'none';
                        });
                    }
                });

                popup.querySelector('.add-btn').addEventListener('click', () => {
                    const taskText = popup.querySelector('.task-input').value.trim();
                    if (taskText) {
                        const dateKey = this.dataset.date;

                        if (!window.tasks[dateKey]) {
                            window.tasks[dateKey] = [];
                        }

                        const newTask = {
                            text: taskText,
                            color: selectedColor
                        };
                        window.tasks[dateKey].push(newTask);

                        updateTaskBlocks(this, dateKey);
                        if (isToday(dateKey)) {
                            updateTodayTasks();
                        }
                        updateUpcomingTasks();
                        popup.remove();
                    }
                });
            });
        }
    });

    // Click outside handler to close popup
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.task-entry-popup') && !e.target.closest('.day')) {
            const popup = document.querySelector('.task-entry-popup');
            if (popup) popup.remove();
        }
    });

    // Initial updates
    updateTodayTasks();
    updateUpcomingTasks();

    // Weather API (Use HTTPS)
    async function fetchWeather() {
        const API_KEY = 'd87525f94789439ca88202318241012';
        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`
                );
                const data = await response.json();

                const weatherIcon = document.createElement('span');
                weatherIcon.className = 'weather-icon';

                weatherIcon.innerHTML = `
                    <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
                    <span class="temperature">${Math.round(data.current.temp_f)}°F</span>
                `;

                const dateDisplay = document.querySelector('.date-display');
                dateDisplay.appendChild(weatherIcon);
            });
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    }

    fetchWeather();
});
