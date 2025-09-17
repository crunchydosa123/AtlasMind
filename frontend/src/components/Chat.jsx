import React, { useState, useRef, useEffect } from 'react';

const Chat = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateEmbeddings = async (text) => {
        try {
            const response = await fetch('http://localhost:3000/embeddings/getEmbedding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            return data.embedding;
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            type: 'user',
            content: inputMessage
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // 1. Generate embeddings for the message
            const embeddings = await generateEmbeddings(inputMessage);

            // 2. Process chat with context
            const response = await fetch('http://localhost:3000/chat/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    namespace: projectId,
                    embeddings
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const assistantMessage = {
                type: 'assistant',
                content: data.message,
                context: data.context
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error processing message:', error);
            const errorMessage = {
                type: 'error',
                content: 'Sorry, there was an error processing your message. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${
                            message.type === 'user'
                                ? 'bg-blue-100 ml-auto max-w-[80%]'
                                : message.type === 'assistant'
                                ? 'bg-gray-100 mr-auto max-w-[80%]'
                                : 'bg-red-100 mr-auto max-w-[80%]'
                        }`}
                    >
                        <p className="text-gray-800">{message.content}</p>
                        {message.context && (
                            <details className="mt-2">
                                <summary className="text-sm text-gray-600 cursor-pointer">
                                    View Context
                                </summary>
                                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                    {message.context}
                                </p>
                            </details>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Chat; 