import React, { useState } from 'react';

const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        setTodos([...todos, { text: input, done: false }]);
        setInput('');
    };

    const toggleDone = (idx) => {
        setTodos(todos.map((todo, i) =>
            i === idx ? { ...todo, done: !todo.done } : todo
        ));
    };

    const handleDelete = (idx) => {
        setTodos(todos.filter((_, i) => i !== idx));
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
            <h2>Todo List</h2>
            <form onSubmit={handleAdd} style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Thêm  mới"
                    style={{ width: '70%', marginRight: 8 }}
                />
                <button type="submit">Thêm</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.map((todo, idx) => (
                    <li key={idx} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleDone(idx)}
                            style={{ marginRight: 8 }}
                        />
                        <span style={{
                            textDecoration: todo.done ? 'line-through' : 'none',
                            flex: 1
                        }}>{todo.text}</span>
                        <button onClick={() => handleDelete(idx)} style={{ marginLeft: 8 }}>Xóa</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
