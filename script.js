const API_URL = 'https://dummyjson.com/todos';
const todoContainer = document.getElementById('todoContainer');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageIndicatorContainer = document.getElementById('page-numbers');

let searchQuery = '';
let filterStartDate = null;
let filterEndDate = null;


const toggleButton = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const darkModeIcon = document.getElementById('darkModeIcon');

// Toggle dark/light mode with icon
toggleButton.addEventListener('click', () => {
  htmlElement.classList.toggle('dark');
  updateDarkModeIcon();
});

function updateDarkModeIcon() {
  const isDark = htmlElement.classList.contains('dark');
  darkModeIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
}
updateDarkModeIcon(); // Initial icon state

const addTodoForm = document.getElementById("addTodoForm");
const todoInput = document.getElementById("todoInput");
const prioritySelect = document.getElementById("prioritySelect");

const pageSize = 5;
let currentPage = 1;
let allTodos = [];

// Save todos to localStorage
function saveTodosToLocalStorage() {
  localStorage.setItem('todos', JSON.stringify(allTodos));
}

// Load todos from localStorage or API
async function fetchTodos() {
  const localData = localStorage.getItem('todos');
  if (localData) {
    allTodos = JSON.parse(localData);
    renderTodos();
  } else {
    const res = await fetch(`${API_URL}?limit=100`);
    const data = await res.json();
    allTodos = data.todos.sort((a, b) => b.id - a.id);
    saveTodosToLocalStorage();
    renderTodos();
  }
}

document.querySelector('input[placeholder="Search tasks..."]').addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  currentPage = 1;
  renderTodos();
});

document.getElementById('start-date').addEventListener('change', (e) => {
  filterStartDate = e.target.value ? new Date(e.target.value).setHours(0, 0, 0, 0) : null;
  currentPage = 1;
  renderTodos();
});

document.getElementById('end-date').addEventListener('change', (e) => {
  filterEndDate = e.target.value ? new Date(e.target.value).setHours(23, 59, 59, 999) : null;
  currentPage = 1;
  renderTodos();
});


addTodoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = todoInput.value.trim();
  const priority = parseInt(prioritySelect.value);

  if (!task || !priority) return;

  const newTodo = {
    id: Date.now(),
    todo: task,
    priority: priority,
    completed: false,
    createdAt: Date.now()
  };

  allTodos.unshift(newTodo);
  saveTodosToLocalStorage(); // Save after adding

  addTodoForm.reset();
  currentPage = 1;
  renderTodos();
});

function createTodo(text, isCompleted = false, priority = 1) {
  const newLabel = document.createElement('label');
  newLabel.className = 'flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md shadow-sm gap-3';

  // Priority label
  const newPriorityLabel = document.createElement('span');
  newPriorityLabel.classList.add('text-xs', 'font-semibold', 'px-2', 'py-1', 'rounded');

  if (priority === 1) {
    newPriorityLabel.innerText = 'Very Low';
    newPriorityLabel.classList.add('bg-blue-400', 'text-white');
  } else if (priority === 2) {
    newPriorityLabel.innerText = 'Low';
    newPriorityLabel.classList.add('bg-green-400', 'text-black');
  } else if (priority === 3) {
    newPriorityLabel.innerText = 'Medium';
    newPriorityLabel.classList.add('bg-yellow-400', 'text-black');
  } else if (priority === 4) {
    newPriorityLabel.innerText = 'High';
    newPriorityLabel.classList.add('bg-orange-500', 'text-white');
  } else if (priority === 5) {
    newPriorityLabel.innerText = 'Very High';
    newPriorityLabel.classList.add('bg-red-600', 'text-white');
  }

  // Checkbox
  const newCheckbox = document.createElement('input');
  newCheckbox.type = 'checkbox';
  newCheckbox.name = 'todo';
  newCheckbox.className = 'form-checkbox h-5 w-5 text-blue-600';
  newCheckbox.checked = isCompleted;

  // Todo text
  const newSpan = document.createElement('span');
  newSpan.className = 'text-gray-800 dark:text-gray-100 flex-1';
  newSpan.textContent = text;

  if (isCompleted) {
    newSpan.classList.add('line-through', 'text-gray-400');
  }

  // Checkbox change handler
  newCheckbox.addEventListener('change', () => {
    newSpan.classList.toggle('line-through');
    newSpan.classList.toggle('text-gray-400');

    const todoItem = allTodos.find(t => t.todo === text);
    if (todoItem) {
      todoItem.completed = newCheckbox.checked;
      saveTodosToLocalStorage();
    }
  });

  // Append elements
  newLabel.appendChild(newCheckbox);
  newLabel.appendChild(newSpan);
  newLabel.appendChild(newPriorityLabel);

  return newLabel;
}


function createPageIndicator(pageNumber) {
  const newButton = document.createElement('button');
  newButton.innerHTML = pageNumber;
  newButton.className =
    'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0';

  if (pageNumber === currentPage) {
    newButton.classList.add('bg-blue-500', 'text-white');
  }

  newButton.addEventListener('click', () => {
    currentPage = pageNumber;
    renderTodos();
  });

  pageIndicatorContainer.appendChild(newButton);
}

function renderPageNumbers(currentPage, maxPages) {
  pageIndicatorContainer.innerHTML = '';

  createPageIndicator(1);
  if (currentPage > 3) {
    const dots1 = document.createElement('span');
    dots1.textContent = '...';
    dots1.className = 'px-2 text-gray-500';
    pageIndicatorContainer.appendChild(dots1);
  }

  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i > 1 && i < maxPages) {
      createPageIndicator(i);
    }
  }

  if (currentPage < maxPages - 2) {
    const dots2 = document.createElement('span');
    dots2.textContent = '...';
    dots2.className = 'px-2 text-gray-500';
    pageIndicatorContainer.appendChild(dots2);
  }

  if (maxPages > 1) {
    createPageIndicator(maxPages);
  }
}

function renderPageControls(currentPage, maxPages) {
  prevBtn.classList.toggle('hidden', currentPage === 1);
  nextBtn.classList.toggle('hidden', currentPage === maxPages);
}

function renderTodos() {
  // Filter todos based on search and date
  const filtered = allTodos.filter(todo => {
    const matchesSearch = todo.todo.toLowerCase().includes(searchQuery);
    const createdDate = new Date(todo.createdAt);

    const matchesStartDate = !filterStartDate || createdDate >= filterStartDate;
    const matchesEndDate = !filterEndDate || createdDate <= filterEndDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const maxPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleData = filtered.slice(startIndex, startIndex + pageSize);

  todoContainer.innerHTML = '';
  visibleData.forEach((todo) => {
    const newTodoEl = createTodo(todo.todo, todo.completed, todo.priority);

    todoContainer.appendChild(newTodoEl);
  });

  renderPageNumbers(currentPage, maxPages);
  renderPageControls(currentPage, maxPages);
}


prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTodos();
  }
});

nextBtn.addEventListener('click', () => {
  const maxPages = Math.ceil(allTodos.length / pageSize);
  if (currentPage < maxPages) {
    currentPage++;
    renderTodos();
  }
});



fetchTodos();
