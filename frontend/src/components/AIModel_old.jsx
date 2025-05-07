import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Textarea,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from "@chakra-ui/react";
import { Client } from "@gradio/client";
import { useSetRecoilState } from "recoil";
import { conversationsAtom } from "../atoms/messagesAtom";
import { getUserIdByUsername } from "../utils/api";

const AIModal = ({ currentUser }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const setConversations = useSetRecoilState(conversationsAtom);
    const [gradioClient, setGradioClient] = useState(null);

    const URL_AI = "https://cb7805770aa7f4c011.gradio.live"

    useEffect(() => {
        const initClient = async () => {
            try {
                const client = await Client.connect(URL_AI);
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
                chat_history: [],
            });

            const aiResponse = result.data[1][0][1];
            console.log("Raw AI Response:", aiResponse);

            try {
                if (!aiResponse) {
                    setChatHistory(prev => [...prev.slice(0, -1), [message, "AI did not return a valid response."]]);
                    return;
                }

                let jsonStr = aiResponse.toString().replace(/```(json)?/g, '').trim();
                jsonStr = jsonStr.replace(/'/g, '"');

                if (!jsonStr.startsWith('[') && !jsonStr.startsWith('{')) {
                    setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse]]);
                    return;
                }

                const toolCalls = JSON.parse(jsonStr);

                if (Array.isArray(toolCalls) && toolCalls.length > 0) {
                    for (const call of toolCalls) {
                        if (call.name === "send_message") {
                            const { recipient: username, message: msgContent } = call.arguments;
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
                                        message: msgContent,
                                        recipientId: recipientId,
                                    }),
                                });

                                if (!res.ok) {
                                    const errorData = await res.json();
                                    throw new Error(errorData.error || 'Gửi tin nhắn thất bại');
                                }

                                const data = await res.json();
                                setConversations(prev => updateConversations(prev, recipientId, msgContent, data.sender));
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
                setChatHistory(prev => [...prev.slice(0, -1), [
                    message,
                    aiResponse || "AI returned an invalid or empty response."
                ]]);
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
        <>
            {/* Button to trigger the modal */}
            <Button
                position="fixed"
                bottom="16"
                left="4"
                colorScheme="blue"
                onClick={onOpen}
                zIndex="9999"
                borderRadius="full"
                boxShadow="lg"
                p={6}
                fontSize="lg"
            >
                AI Assistant
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent borderRadius="md" boxShadow="xl">
                    <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold" color="blue.600">
                        AI Assistant
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box mb={4} maxH="300px" overflowY="auto">
                            {chatHistory.map(([userMsg, aiMsg], index) => (
                                <Box key={index} mb={2}>
                                    <Box fontWeight="bold" color="teal.500">{currentUser.username}: {userMsg}</Box>
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
                            borderColor="blue.400"
                            focusBorderColor="blue.500"
                            size="lg"
                            borderRadius="md"
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            onClick={handleSendMessage}
                            isLoading={isLoading}
                            colorScheme="blue"
                            isDisabled={!message.trim()}
                            borderRadius="md"
                        >
                            Send
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AIModal;
