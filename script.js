const STORAGE_KEY = 'taskflow_user';
const TASKS_KEY = 'taskflow_tasks';
let currentTab = 'todo';
let tasks = { todo: [], completed: [], archived: [] };

window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!user) window.location.href = 'index.html';
  document.getElementById('userName').textContent = user.name;
  document.getElementById('avatar').src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.name}`;
  loadTasks();
});

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  if (saved) {
    tasks = JSON.parse(saved);
    renderTasks();
  } else {
    fetch('https://dummyjson.com/todos')
      .then(res => res.json())
      .then(data => {
        tasks.todo = data.todos.slice(0, 5).map(todo => ({
          text: todo.todo,
          timestamp: new Date().toLocaleString()
        }));
        saveTasks();
        renderTasks();
      });
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const active = tasks[currentTab];
  ['todo', 'completed', 'archived'].forEach(type => {
    document.getElementById(`count${capitalize(type)}`).textContent = tasks[type].length;
  });

  active.forEach((task, i) => {
    const card = document.createElement('div');
    card.className = 'bg-gray-700 p-4 rounded shadow-md';
    card.innerHTML = `
      <p>${task.text}</p>
      <small class="block text-gray-300">Last modified: ${task.timestamp}</small>
      <div class="mt-2 space-x-2">
        ${getButtons(currentTab, i)}
      </div>`;
    list.appendChild(card);
  });
    // Calculate progress
  const total = tasks.todo.length + tasks.completed.length;
  const done = tasks.completed.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressPercent').textContent = `${percent}%`;
}

function getButtons(type, i) {
  if (type === 'todo') {
    return `<button onclick="move('todo','completed',${i})" class="bg-green-500 px-2 py-1 rounded">✅</button>
            <button onclick="move('todo','archived',${i})" class="bg-yellow-500 px-2 py-1 rounded">📦</button>`;
  }
  if (type === 'completed') {
    return `<button onclick="move('completed','todo',${i})" class="bg-blue-500 px-2 py-1 rounded">↩️</button>
            <button onclick="move('completed','archived',${i})" class="bg-yellow-500 px-2 py-1 rounded">📦</button>`;
  }
  return `<button onclick="move('archived','todo',${i})" class="bg-blue-500 px-2 py-1 rounded">↩️</button>
          <button onclick="move('archived','completed',${i})" class="bg-green-500 px-2 py-1 rounded">✅</button>`;
}

function move(from, to, i) {
  const t = tasks[from][i];
  t.timestamp = new Date().toLocaleString();
  tasks[to].push(t);
  tasks[from].splice(i, 1);
  saveTasks();
  renderTasks();
}

function switchTab(tab) {
  currentTab = tab;

  ['todo', 'completed', 'archived'].forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (t === tab) {
      btn.classList.remove('bg-white', 'text-black');
      btn.classList.add('bg-indigo-500', 'text-white', 'scale-95');
    } else {
      btn.classList.remove('bg-indigo-500', 'text-white', 'scale-95');
      btn.classList.add('bg-white', 'text-black');
    }
  });

  renderTasks();
}

function addTask() {
  const val = document.getElementById('taskInput').value.trim();
  if (!val) return;
  tasks.todo.push({ text: val, timestamp: new Date().toLocaleString() });
  document.getElementById('taskInput').value = '';
  saveTasks();
  switchTab('todo');
}

function signOut() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}