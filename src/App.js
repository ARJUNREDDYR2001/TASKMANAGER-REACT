import React, { useState } from 'react';
import './App.css';

const WEATHER_API_KEY = 'a6ed1bec8d10216f1253ab60b8b43d48';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const MOVIE_API_KEY = 'f670be36';
const MOVIE_API_URL = 'http://www.omdbapi.com/';

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState(null); // State to track editing entry index

  const handleNewTask = () => {
    const newTask = {
      id: tasks.length + 1,
      title: `Task ${tasks.length + 1}`,
      type: tasks.length % 2 === 0 ? 'weather' : 'movie',
      entries: [],
    };
    setTasks([...tasks, newTask]);
    setCurrentTask(newTask);
  };

  const handleTaskClick = (task) => {
    setCurrentTask(task);
  };

  const handleTaskDelete = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    if (updatedTasks.length === 0) {
      setCurrentTask(null);
    } else if (currentTask && currentTask.id === taskId) {
      setCurrentTask(updatedTasks[0]);
    }
  };

  const fetchWeather = async (city) => {
    try {
      const response = await fetch(`${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
      if (!response.ok) {
        throw new Error('Weather data not found!');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchMovie = async (movieName) => {
    try {
      const response = await fetch(`${MOVIE_API_URL}?t=${encodeURIComponent(movieName)}&apikey=${MOVIE_API_KEY}`);
      if (!response.ok) {
        throw new Error('Movie data not found!');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie:', error);
    }
  };

  const handleNewEntrySubmit = async () => {
    let newData = null;
    if (currentTask.type === 'weather') {
      newData = await fetchWeather(newEntry);
    } else if (currentTask.type === 'movie') {
      newData = await fetchMovie(newEntry);
    }

    if (newData) {
      const updatedTasks = tasks.map((task) =>
        task.id === currentTask.id
          ? { ...task, entries: [...task.entries, { name: newEntry, data: newData, completed: false }] }
          : task
      );
      setTasks(updatedTasks);
      setCurrentTask(updatedTasks.find((task) => task.id === currentTask.id));
      setNewEntry('');
    }
  };

  const handleEntryDelete = (entryIndex) => {
    const updatedEntries = currentTask.entries.filter((_, index) => index !== entryIndex);
    const updatedTasks = tasks.map((task) =>
      task.id === currentTask.id ? { ...task, entries: updatedEntries } : task
    );
    setTasks(updatedTasks);
    setCurrentTask(updatedTasks.find((task) => task.id === currentTask.id));
  };

  const handleEntryEdit = (entryIndex) => {
    setEditingEntry(entryIndex); 
  };

  const handleEntrySave = async (entryIndex) => {
    const entry = currentTask.entries[entryIndex];
    let newData = null;
    if (currentTask.type === 'weather') {
      newData = await fetchWeather(entry.name);
    } else if (currentTask.type === 'movie') {
      newData = await fetchMovie(entry.name);
    }

    if (newData) {
      const updatedEntries = currentTask.entries.map((entry, index) =>
        index === entryIndex ? { ...entry, data: newData } : entry
      );
      const updatedTasks = tasks.map((task) =>
        task.id === currentTask.id ? { ...task, entries: updatedEntries } : task
      );
      setTasks(updatedTasks);
      setCurrentTask(updatedTasks.find((task) => task.id === currentTask.id));
      setEditingEntry(null); 
    }
  };

  const handleEntryChange = (entryIndex, newName) => {
    const updatedEntries = currentTask.entries.map((entry, index) =>
      index === entryIndex ? { ...entry, name: newName } : entry
    );
    const updatedTasks = tasks.map((task) =>
      task.id === currentTask.id ? { ...task, entries: updatedEntries } : task
    );
    setTasks(updatedTasks);
    setCurrentTask(updatedTasks.find((task) => task.id === currentTask.id));
  };

  const handleCheckboxChange = (entryIndex) => {
    const updatedEntries = currentTask.entries.map((entry, index) =>
      index === entryIndex ? { ...entry, completed: !entry.completed } : entry
    );
    const updatedTasks = tasks.map((task) =>
      task.id === currentTask.id ? { ...task, entries: updatedEntries } : task
    );
    setTasks(updatedTasks);
    setCurrentTask(updatedTasks.find((task) => task.id === currentTask.id));
  };

  return (
    <div className="App">
      <h1>Task Manager</h1>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-tab">
            <button onClick={() => handleTaskClick(task)} className={task.id === currentTask?.id ? 'active' : ''}>
              {task.title}
              <button onClick={() => handleTaskDelete(task.id)} className="delete-task">X</button>
            </button>
          </div>
        ))}
        <div className="new-task">
          <button onClick={handleNewTask}>Add Task</button>
        </div>
      </div>
      <div className="task-details">
        {currentTask && tasks.length > 0 && (
          <>
            <h2>{currentTask.title}</h2>
            <input
              type="text"
              placeholder={currentTask.type === 'weather' ? 'Enter city name' : 'Enter movie name'}
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
            />
            <button onClick={handleNewEntrySubmit}>
              {currentTask.type === 'weather' ? 'Get Weather' : 'Get Movie Details'}
            </button>
            {currentTask.entries.map((entry, index) => (
              <div key={index} className="entry">
                <input
                  type="checkbox"
                  checked={entry.completed}
                  onChange={() => handleCheckboxChange(index)}
                />
                {editingEntry === index ? (
                  <>
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => handleEntryChange(index, e.target.value)}
                    />
                    <button onClick={() => handleEntrySave(index)} className="save-entry">Save</button>
                  </>
                ) : (
                  <>
                    <span className={entry.completed ? 'completed' : ''}>{entry.name}</span>
                    <button onClick={() => handleEntryEdit(index)} className="edit-entry">Edit</button>
                  </>
                )}
                <button onClick={() => handleEntryDelete(index)} className="delete-entry">Delete</button>
                {entry.data && currentTask.type === 'weather' && (
                  <div className="weather-data">
                    <p>Temperature: {entry.data.main.temp}°C</p>
                    <p>Description: {entry.data.weather[0].description}</p>
                  </div>
                )}
                {entry.data && currentTask.type === 'movie' && (
                  <div className="movie-data">
                    <p>Title: {entry.data.Title}</p>
                    <p>Plot: {entry.data.Plot}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
