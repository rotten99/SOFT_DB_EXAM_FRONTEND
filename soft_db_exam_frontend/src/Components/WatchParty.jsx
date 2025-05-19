import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import watchPartyFacade from '../Facades/WatchPartyFacade';
import userFacade from '../Facades/UserFacade';
import './WatchParties.css';

export default function WatchParty() {
    const { id } = useParams();
    const nav = useNavigate();
    const chatRef = useRef();
    const me = parseInt(localStorage.getItem('userId') || '0', 10);

    const [party, setParty] = useState(null);
    const [userName, setUserName] = useState('');
    const [conn, setConn] = useState(null);
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        watchPartyFacade.getById(id)
            .then(setParty)
            .catch(() => nav('/watchlists'));
    }, [id, nav]);

    useEffect(() => {
        if (!party) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5199/hub/watchparty")
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', ({ user, message, timestamp }) => {
            setMessages(msgs => [
                ...msgs,
                { user, text: message, time: new Date(timestamp).toLocaleTimeString() }
            ]);
            setTimeout(() => {
                chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
            }, 50);
        });

        connection.start()
            .then(async () => {
                const uname = await watchPartyFacade.join(party.id, me);
                setUserName(uname);
                await connection.invoke('JoinParty', +party.id, uname);
            })
            .catch(err => console.error('SignalR error:', err));

        setConn(connection);
        return () => connection.stop();
    }, [party, me]);

    const send = () => {
        if (!msg.trim() || !conn) return;
        conn.invoke('SendMessageToParty', +party.id, userName, msg);
        setMsg('');
    };

    if (!party) return <p>Loading watch party…</p>;

    return (
        <div className="watchparty-container">
            <button onClick={() => nav(-1)} className="btn-back">← Back</button>

            <div className="watchparty-header">
                <h2>{party.title}</h2>
                <p><strong>🎬 Movies:</strong> {party.movies.map(m => m.title).join(', ')}</p>
                <p><strong>👥 Participants:</strong> {party.users.map(u => u.userName).join(', ')}</p>
            </div>

            <div className="chat-box">
                <div ref={chatRef} className="chat-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-message ${m.user === userName ? 'me' : ''}`}>
                            <span className="chat-user">{m.user}</span>
                            <span className="chat-time">[{m.time}]</span>:
                            <span className="chat-text"> {m.text}</span>
                        </div>
                    ))}
                </div>

                <div className="chat-input-box">
                    <input
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send()}
                        placeholder="Type a message…"
                    />
                    <button onClick={send}>Send</button>
                </div>
            </div>
        </div>
    );
}
