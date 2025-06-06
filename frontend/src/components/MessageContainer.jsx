import {
    Flex,
    useColorModeValue,
    Avatar,
    Text,
    Image,
    Divider,
    SkeletonCircle,
    Skeleton
} from "@chakra-ui/react"
import Message from "./Message";
import MessageInput from "./MessageInput"
import useShowToast from "../hooks/useShowToast"
import { useEffect, useRef, useState } from "react"
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom"
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { useSocket } from "../../context/SocketContext"

const MessageContainer = () => {
    const showToast = useShowToast()
    const selectedConversation = useRecoilValue(selectedConversationAtom)
    const [loadingMessages, setLoadingMessages] = useState(true)
    const [messages, setMessages] = useState([])
    const currentUser = useRecoilValue(userAtom)
    const { socket } = useSocket()
    const [conversations, setConversations] = useRecoilState(conversationsAtom)
    const messageEndRef = useRef(null)
    // console.log("Messages: ", messages)
    console.log("Conversations: ", conversations)
    useEffect(() => {
        socket.on('newMessage', (message) => {

            if (selectedConversation._id === message.conversationId) {
                setMessages((prevMessages) => [...prevMessages, message])
            }
            // Update the last message for another user when a new message is sent
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            },
                        }
                    }
                    return conversation
                })
                // return updatedConversations

                const sortedConversations = [...updatedConversations].sort((a, b) => {
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });

                console.log("Sorted conversations:", sortedConversations);
                return sortedConversations;

            })

        })

        return () => socket.off('newMessage')
    }, [socket, selectedConversation, setConversations])


    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const lastMessageFromOtherUser = messages[messages.length - 1]?.sender !== currentUser._id
        if (lastMessageFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation?._id,
                senderId: selectedConversation?.userId
            })
        }

        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                setMessages(prev => {
                    const updatedMessages = prev.map(message => {
                        if (!message.seen) {
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message
                    })
                    return updatedMessages

                })
            }
        })
    }, [socket, messages, currentUser._id, selectedConversation])

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true)
            setMessages([])
            try {
                if (selectedConversation.mock) return
                const res = await fetch(`/api/messages/${selectedConversation.userId}`)
                const data = await res.json()
                if (data.error) {
                    showToast("Error", data.error, 'error')
                    return
                }
                setMessages(data)
            } catch (error) {
                showToast("Error", error.message, 'error')
            } finally {
                setLoadingMessages(false)
            }
        }

        getMessages()
    }, [showToast, selectedConversation.userId, selectedConversation.mock])


    return (
        <Flex
            flex={70}
            bg={useColorModeValue('gray.200', 'gray.dark')}
            borderRadius={'md'}
            flexDirection={'column'}
            p={2}
        >
            {/* Message header */}
            <Flex w={'full'} h={12} alignItems={'center'} gap={2}>
                <Avatar src={selectedConversation.userProfilePic} size={'sm'} />
                <Text display={'flex'} alignItems={'center'}>
                    {selectedConversation.username} <Image src='./verified.png' w={4} h={4} alt='avatar' ml={1} />
                </Text>
            </Flex>
            <Divider />
            {/* Message */}

            <Flex
                flexDirection={'column'}
                gap={4}
                my={4}
                height={'400px'}
                overflowY={'auto'}
                px={2}
            >
                {loadingMessages && (
                    [...Array(5)].map((_, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={'center'}
                            p={1}
                            borderRadius={'md'}
                            alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={'7'} />}
                            <Flex flexDir={'column'} gap={2}>
                                <Skeleton h={'8px'} w={'250px'} />
                                <Skeleton h={'8px'} w={'250px'} />
                                <Skeleton h={'8px'} w={'250px'} />

                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={'7'} />}
                        </Flex>
                    ))
                )}

                {!loadingMessages && (
                    messages.map((message) => (
                        <Flex key={message._id} direction={'column'} ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}>
                            <Message
                                message={message}
                                ownMessage={currentUser._id === message.sender}
                            />
                        </Flex>
                    ))
                )}
            </Flex>
            <MessageInput setMessages={setMessages} />
        </Flex>
    )
}

export default MessageContainer