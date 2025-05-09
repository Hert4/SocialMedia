import { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    useDisclosure,
    Avatar,
    Flex,
    Heading,
    IconButton,
    Spinner,
    useColorModeValue,
    Input,
    InputGroup,
    InputRightElement
} from "@chakra-ui/react";
import { Client } from "@gradio/client";
import { useSetRecoilState } from "recoil";
import { conversationsAtom } from "../atoms/messagesAtom";
import { getUserIdByUsername } from "../utils/api";
import { FaEllipsisVertical } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { BsRobot } from "react-icons/bs";
import { HiOutlineChevronDown } from "react-icons/hi";

const AIModal = ({ currentUser }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const setConversations = useSetRecoilState(conversationsAtom);
    const [gradioClient, setGradioClient] = useState(null);
    const messagesEndRef = useRef(null);
    const [isGradioAvailable, setIsGradioAvailable] = useState(true);

    const URL_AI = "https://54effadad5d996a177.gradio.live";

    // Premium iOS colors
    const bubbleBgUser = "#007AFF";
    const bubbleBgAI = useColorModeValue("#F2F2F7", "#1C1C1E");
    const textColorUser = "white";
    const textColorAI = useColorModeValue("black", "white");
    const inputBg = useColorModeValue("white", "#2C2C2E");
    const headerBg = useColorModeValue("#FBFBFD", "#1C1C1E");
    const footerBg = useColorModeValue("#FBFBFD", "#1C1C1E");
    const modalBg = useColorModeValue("#FBFBFD", "#000000");
    const placeholderColor = useColorModeValue("#8E8E93", "#8E8E93");
    const timeTextColor = useColorModeValue("#8E8E93", "#8E8E93");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    useEffect(() => {
        const initClient = async () => {
            try {
                const client = await Client.connect(URL_AI);
                setGradioClient(client);
                setIsGradioAvailable(true);
            } catch (error) {
                console.error("Failed to connect to Gradio client:", error);
                setIsGradioAvailable(false);
                toast({
                    title: "AI service unavailable",
                    description: "The AI assistant is currently offline. Please try again later.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        if (isOpen) {
            initClient();
        }
    }, [isOpen, toast]);

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

    const parseAIResponse = (response) => {
        try {
            // First try to parse directly
            const parsed = JSON.parse(response);
            return parsed;
        } catch (e) {
            // If direct parse fails, try cleaning the response
            try {
                const cleaned = response
                    .replace(/```(json)?/g, '')
                    .trim()
                    .replace(/'/g, '"') // Replace single quotes with double quotes
                    .replace(/(\w+):/g, '"$1":') // Add quotes around keys
                    .replace(/: "([^"]+)"/g, (match, p1) => `: "${p1.replace(/"/g, '\\"')}"`); // Escape existing double quotes

                return JSON.parse(cleaned);
            } catch (e2) {
                console.error("Failed to parse AI response:", e2);
                return null;
            }
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !gradioClient) return;

        setIsLoading(true);
        const newHistory = [...chatHistory, [message, null]];
        setChatHistory(newHistory);

        try {
            const result = await gradioClient.predict("/respond", {
                message: message,
            });

            const aiResponse = result.data[1][0][1];

            if (!aiResponse) {
                setChatHistory(prev => [...prev.slice(0, -1), [message, "AI did not return a valid response."]]);
                return;
            }

            // First try to parse as JSON
            let toolCalls = parseAIResponse(aiResponse);

            // If parsing failed, check if it's a plain text response
            if (!toolCalls || (Array.isArray(toolCalls) && toolCalls.length === 0)) {
                setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse]]);
                return;
            }

            // Ensure toolCalls is an array
            if (!Array.isArray(toolCalls)) {
                toolCalls = [toolCalls];
            }

            // Process tool calls
            for (const call of toolCalls) {
                if (call.name === "send_message") {
                    const { recipient: username, message: msgContent } = call.arguments;
                    const trimmedUsername = username.trim();

                    try {
                        const recipientId = await getUserIdByUsername(trimmedUsername);

                        const res = await fetch('/api/messages/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: msgContent, recipientId }),
                        });

                        if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.error || 'Failed to send message');
                        }

                        const data = await res.json();

                        setConversations(prev => updateConversations(prev, recipientId, msgContent, data.sender));

                        setChatHistory(prev => [
                            ...prev.slice(0, -1),
                            [message, `I have sent a message to ${trimmedUsername} for you!`]
                        ]);

                        toast({
                            title: "Success",
                            description: `Message sent to ${trimmedUsername}`,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });

                    } catch (error) {
                        toast({
                            title: "Error",
                            description: error.message,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        setChatHistory(prev => [
                            ...prev.slice(0, -1),
                            [message, `Failed to send message: ${error.message}`]
                        ]);
                    }
                } else if (call.name === "update_profile") {
                    try {
                        const { name, username, email, bio } = call.arguments || {};

                        const updateData = {};
                        if (name) updateData.name = name;
                        if (username) updateData.username = username;
                        if (email) updateData.email = email;
                        if (bio) updateData.bio = bio;

                        const res = await fetch(`/api/users/update/${currentUser._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updateData),
                        });

                        // Clone the response before reading it
                        const responseClone = res.clone();

                        if (!res.ok) {
                            const errorData = await responseClone.json();
                            throw new Error(errorData.error || 'Failed to update profile');
                        }

                        const data = await responseClone.json();
                        localStorage.setItem("user-threads", JSON.stringify(data));

                        toast({
                            title: "Success",
                            description: "Profile updated successfully",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });

                        setChatHistory(prev => [
                            ...prev.slice(0, -1),
                            [message, `Your profile has been updated successfully!`]
                        ]);
                    } catch (error) {
                        console.error("Update error:", error);
                        toast({
                            title: "Error",
                            description: error.message,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        setChatHistory(prev => [
                            ...prev.slice(0, -1),
                            [message, `Failed to update profile: ${error.message}`]
                        ]);
                    }
                }
            }
        } catch (e) {
            console.error("Error:", e);
            toast({
                title: "AI Error",
                description: "Failed to process AI response",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setChatHistory(prev => [...prev.slice(0, -1), [message, aiResponse || "Sorry, I couldn't process your request."]]);
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
            <Button
                position="fixed"
                bottom={{ base: "24", md: "32" }}
                right={{ base: "6", md: "8" }}
                onClick={onOpen}
                zIndex="999"
                borderRadius="full"
                boxShadow="0px 8px 24px rgba(0, 122, 255, 0.25)"
                px={6}
                py={5}
                fontSize="md"
                leftIcon={<BsRobot size={20} />}
                bg="linear-gradient(135deg, #007AFF 0%, #34C759 100%)"
                color="white"
                _hover={{
                    bg: "linear-gradient(135deg, #0066CC 0%, #2DBE54 100%)",
                    transform: "scale(1.05)"
                }}
                _active={{
                    transform: "scale(0.95)"
                }}
                transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
            >
                AI Assistant
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="scale">
                <ModalOverlay bg="rgba(0,0,0,0.5)" backdropFilter="blur(12px)" />
                <ModalContent
                    borderRadius="2xl"
                    maxH="85vh"
                    minH="70vh"
                    display="flex"
                    flexDirection="column"
                    border="none"
                    overflow="hidden"
                    bg={modalBg}
                    boxShadow="0px 16px 48px rgba(0, 0, 0, 0.2)"
                >
                    <ModalHeader
                        bg={headerBg}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={4}
                        borderBottom="1px solid"
                        borderBottomColor={useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)")}
                    >
                        <Flex alignItems="center" gap={3}>
                            <Avatar
                                icon={<BsRobot size={18} />}
                                bg="linear-gradient(135deg, #007AFF 0%, #34C759 100%)"
                                color="white"
                                size="md"
                                boxShadow="0px 4px 12px rgba(0, 122, 255, 0.3)"
                            />
                            <Box>
                                <Heading size="md" fontWeight="600">Mem AI</Heading>
                                <Box fontSize="xs" color={placeholderColor}>
                                    {isLoading ? (
                                        <Flex align="center" gap={1}>
                                            <Box w="6px" h="6px" borderRadius="full" bg="#34C759" />
                                            <Box>Responding...</Box>
                                        </Flex>
                                    ) : (
                                        <Flex align="center" gap={1}>
                                            <Box w="6px" h="6px" borderRadius="full" bg="#34C759" />
                                            <Box>Online</Box>
                                        </Flex>
                                    )}
                                </Box>
                            </Box>
                        </Flex>
                        <Flex gap={3}>
                            <IconButton
                                icon={<FaEllipsisVertical size={16} />}
                                variant="ghost"
                                size="sm"
                                borderRadius="full"
                                aria-label="More options"
                                color={useColorModeValue("gray.600", "gray.400")}
                            />
                            <IconButton
                                icon={<HiOutlineChevronDown size={20} />}
                                variant="ghost"
                                size="sm"
                                borderRadius="full"
                                onClick={onClose}
                                aria-label="Close chat"
                                color={useColorModeValue("gray.600", "gray.400")}
                            />
                        </Flex>
                    </ModalHeader>

                    <ModalBody
                        flex="1"
                        p={4}
                        overflowY="auto"
                        display="flex"
                        flexDirection="column"
                        bg={modalBg}
                        position="relative"
                    >
                        {chatHistory.length === 0 ? (
                            <Flex
                                direction="column"
                                align="center"
                                justify="center"
                                h="100%"
                                color={placeholderColor}
                                textAlign="center"
                                flex="1"
                                gap={4}
                            >
                                <Box
                                    bg={bubbleBgAI}
                                    p={6}
                                    borderRadius="20px"
                                    maxW="85%"
                                    textAlign="left"
                                    boxShadow="0px 4px 16px rgba(0, 0, 0, 0.05)"
                                >
                                    <Flex align="center" gap={2} mb={3}>
                                        <Box
                                            w="8px"
                                            h="8px"
                                            borderRadius="full"
                                            bg="linear-gradient(135deg, #007AFF 0%, #34C759 100%)"
                                        />
                                        <Box fontSize="sm" fontWeight="600" color="#007AFF">Mem AI</Box>
                                    </Flex>
                                    {/* <Box fontSize="lg" fontWeight="500" mb={2}>Hello {currentUser.username}! 👋</Box> */}
                                    <Box fontSize="sm" lineHeight="tall">
                                        I am your premium AI assistant. I can help with messages, fix profiles.
                                        How can I assist you today?
                                    </Box>
                                    <Box fontSize="xs" mt={3} color={timeTextColor}>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Box>
                                </Box>
                                <Box fontSize="xs" color={timeTextColor}>
                                    Premium AI • End-to-end encrypted
                                </Box>
                            </Flex>
                        ) : (
                            <>
                                <Box width="100%" flex="1">
                                    {chatHistory.map(([userMsg, aiMsg], index) => (
                                        <Box key={index} mb={4} width="100%">
                                            {/* User Message */}
                                            <Flex justify="flex-end" mb={3}>
                                                <Flex direction="column" align="flex-end" maxW="85%">
                                                    <Box
                                                        bg={bubbleBgUser}
                                                        p={4}
                                                        borderRadius="20px 6px 20px 20px"
                                                        color={textColorUser}
                                                        boxShadow="0px 4px 12px rgba(0, 122, 255, 0.2)"
                                                        position="relative"
                                                        _before={{
                                                            content: '""',
                                                            position: 'absolute',
                                                            right: '-6px',
                                                            top: '0',
                                                            width: '0',
                                                            height: '0',
                                                            border: '10px solid transparent',
                                                            borderLeftColor: bubbleBgUser,
                                                            borderRight: '0',
                                                            borderTop: '0',
                                                            marginTop: '0',
                                                            transform: 'rotate(-20deg)'
                                                        }}
                                                    >
                                                        {userMsg}
                                                    </Box>
                                                    <Box fontSize="xs" mt={1} color={timeTextColor}>
                                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Box>
                                                </Flex>
                                            </Flex>

                                            {/* AI Message */}
                                            {aiMsg && (
                                                <Flex justify="flex-start" mb={3}>
                                                    <Flex direction="column" align="flex-start" maxW="85%">
                                                        <Box
                                                            bg={bubbleBgAI}
                                                            p={4}
                                                            borderRadius="6px 20px 20px 20px"
                                                            color={textColorAI}
                                                            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.05)"
                                                            position="relative"
                                                            _before={{
                                                                content: '""',
                                                                position: 'absolute',
                                                                left: '-6px',
                                                                top: '0',
                                                                width: '0',
                                                                height: '0',
                                                                border: '10px solid transparent',
                                                                borderRightColor: bubbleBgAI,
                                                                borderLeft: '0',
                                                                borderTop: '0',
                                                                marginTop: '0',
                                                                transform: 'rotate(20deg)'
                                                            }}
                                                        >
                                                            {aiMsg}
                                                        </Box>
                                                        <Box fontSize="xs" mt={1} color={timeTextColor}>
                                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Box>
                                                    </Flex>
                                                </Flex>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                                <Box
                                    position="sticky"
                                    bottom="0"
                                    left="0"
                                    right="0"
                                    bg="linear-gradient(0deg, rgba(251,251,253,1) 0%, rgba(251,251,253,0) 100%)"
                                    h="40px"
                                    display={chatHistory.length > 5 ? "block" : "none"}
                                />
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </ModalBody>

                    <ModalFooter
                        p={3}
                        bg={footerBg}
                        borderTop="1px solid"
                        borderTopColor={useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)")}
                    >
                        <Flex width="100%" align="center" gap={2}>
                            {/* <IconButton
                                icon={<FaMicrophone size={18} />}
                                variant="ghost"
                                borderRadius="full"
                                aria-label="Voice input"
                                color={useColorModeValue("gray.600", "gray.400")}
                                size="lg"
                            /> */}
                            <InputGroup>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Message Mem AI..."
                                    size="md"
                                    borderRadius="full"
                                    border="1px solid"
                                    borderColor={useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)")}
                                    focusBorderColor="#007AFF"
                                    resize="none"
                                    rows={1}
                                    minH="50px"
                                    flex="1"
                                    bg={inputBg}
                                    _placeholder={{
                                        color: placeholderColor,
                                        fontSize: "sm"
                                    }}
                                    fontSize="sm"
                                    px={4}
                                    py={3}
                                />
                                <InputRightElement h="100%" pr={2}>
                                    <IconButton
                                        onClick={handleSendMessage}
                                        isLoading={isLoading}
                                        isDisabled={!message.trim()}
                                        borderRadius="full"
                                        icon={isLoading ? <Spinner size="sm" /> : <IoMdSend size={20} />}
                                        aria-label="Send message"
                                        size="sm"
                                        bg={message.trim() ? "#007AFF" : "transparent"}
                                        color={message.trim() ? "white" : placeholderColor}
                                        _hover={{
                                            bg: message.trim() ? "#0066CC" : "transparent"
                                        }}
                                        transform={message.trim() ? "translateY(-1px)" : "none"}
                                        transition="all 0.2s ease"
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AIModal;