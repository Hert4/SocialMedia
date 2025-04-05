import { useState, useEffect } from "react";
import { Box, Button, Textarea, useToast } from "@chakra-ui/react";
import { Client } from "@gradio/client";
import { useSetRecoilState } from "recoil";
import { conversationsAtom } from "../atoms/messagesAtom";
import { getUserIdByUsername } from "../utils/api";

const AIComponent = ({ currentUser }) => {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const setConversations = useSetRecoilState(conversationsAtom);
    const [gradioClient, setGradioClient] = useState(null);

    useEffect(() => {
        const initClient = async () => {
            try {
                const client = await Client.connect("https://62e9789fed35b2f54f.gradio.live/");
                setGradioClient(client);
            } catch (error) {
                console.error("Failed to connect to Gradio client:", error);
                toast({
                    title: "Connection Error",
                    description: "Failed to connect to AI service",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        initClient();
    }, [toast]);

    const updateConversations = (prevConversations, recipientId, message, sender) => {
        const updated = prevConversations.map(conv => {
            if (conv.userId === recipientId) {
                return {
                    ...conv,
                    lastMessage: { text: message, sender },
                    updatedAt: new Date().toISOString()
                };
            }
            return conv;
        });

        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !gradioClient) return;

        setIsLoading(true);
        try {
            const newHistory = [...chatHistory, [message, null]];
            setChatHistory(newHistory);

            const result = await gradioClient.predict("/respond", {
                message: message,
                chat_history: chatHistory,
            });

            const aiResponse = result.data[1][0][1];
            console.log("Raw AI Response:", aiResponse);

            try {
                let jsonStr = aiResponse.replace(/```(json)?/g, '').trim();
                jsonStr = jsonStr.replace(/'/g, '"');

                if (!jsonStr.startsWith('[') && !jsonStr.startsWith('{')) {
                    setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse]]);
                    return;
                }

                const toolCalls = JSON.parse(jsonStr);

                if (Array.isArray(toolCalls)) {
                    for (const call of toolCalls) {
                        if (call.name === "send_message") {
                            const { recipient: username, message } = call.arguments;
                            const trimmedUsername = username.trim();

                            try {
                                const recipientId = await getUserIdByUsername(trimmedUsername);
                                console.log('Found recipient ID:', recipientId);

                                const res = await fetch('/api/messages/', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        message: message,
                                        recipientId: recipientId,
                                    }),
                                });

                                if (!res.ok) {
                                    const errorData = await res.json();
                                    throw new Error(errorData.error || 'Gửi tin nhắn thất bại');
                                }

                                const data = await res.json();
                                setConversations(prev => updateConversations(prev, recipientId, message, data.sender));
                                toast({
                                    title: "Thành công",
                                    description: `Đã gửi tin nhắn đến ${trimmedUsername}`,
                                    status: "success",
                                    duration: 5000,
                                    isClosable: true,
                                });

                            } catch (error) {
                                console.error(`Error sending to ${trimmedUsername}:`, error);
                                toast({
                                    title: "Lỗi",
                                    description: error.message,
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                });

                                setChatHistory(prev => [
                                    ...prev.slice(0, -1),
                                    [message, `Không thể gửi tin nhắn: ${error.message}`]
                                ]);
                            }
                        } else if (call.name === "respond") {
                            setChatHistory(prev => [...prev.slice(0, -1), [message, call.arguments.message]]);
                        }
                    }
                } else {
                    setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse]]);
                }
            } catch (e) {
                console.error("Error parsing AI response:", e);
                setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse]]);
                toast({
                    title: "Error",
                    description: "Không thể xử lý phản hồi từ AI",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error calling AI:", error);
            toast({
                title: "AI Error",
                description: "Failed to get response from AI",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setChatHistory(prev => [...prev.slice(0, -1)]);
        } finally {
            setIsLoading(false);
            setMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box p={4} borderWidth="1px" borderRadius="lg">
            <Box mb={4} maxH="300px" overflowY="auto">
                {chatHistory.map(([userMsg, aiMsg], index) => (
                    <Box key={index} mb={2}>
                        <Box fontWeight="bold">{currentUser.username}: {userMsg}</Box>
                        {aiMsg && <Box color="gray.600">AI: {aiMsg}</Box>}
                    </Box>
                ))}
            </Box>

            <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                mb={2}
            />

            <Button
                onClick={handleSendMessage}
                isLoading={isLoading}
                colorScheme="blue"
                isDisabled={!message.trim()}
            >
                Send
            </Button>
        </Box>
    );
};

export default AIComponent;