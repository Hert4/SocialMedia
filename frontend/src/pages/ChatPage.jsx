import { SearchIcon } from "@chakra-ui/icons"
import { Box, Button, Input, Skeleton, SkeletonCircle, useColorModeValue } from "@chakra-ui/react"
import { Flex, Text } from "@chakra-ui/react"
import { GiConversation } from "react-icons/gi"
import MessageContainer from "../components/MessageContainer"
import { useEffect, useState } from "react"
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue } from "recoil"
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom"
import Conversation from "../components/Conversation";
import userAtom from "../atoms/userAtom"
import { useSocket } from "../../context/SocketContext"

const ChatPage = () => {
    const showToast = useShowToast()
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [conversations, setConversations] = useRecoilState(conversationsAtom)
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const [searchText, setSearchText] = useState("")
    const [searchingUser, setSearchingUser] = useState(false)
    const currentUser = useRecoilValue(userAtom)
    const { socket, onlineUsers } = useSocket()


    useEffect(() => {
        if (!socket) return
        const getConversation = async () => {
            try {
                const res = await fetch('/api/messages/conversations')
                console.log("Response status:", res.status);

                const data = await res.json()
                if (data.error) {
                    showToast("Error", data.error, 'error')
                    return
                }

                if (!data || data.length === 0) console.log("Empty")


                // console.log(data)

                // setConversations(data)

                const sortedConversations = data.sort((a, b) => {
                    const updatedA = a.updatedAt ? new Date(a.updatedAt) : 0;
                    const updatedB = b.updatedAt ? new Date(b.updatedAt) : 0;
                    return updatedB - updatedA;
                });

                setConversations(sortedConversations);


            } catch (error) {
                // console.error(error)
                showToast("Error", error.message, 'error')
            } finally {
                setLoadingConversations(false)
            }
        }

        getConversation()

    }, [showToast, setConversations])

    const handleConversationSearch = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/users/profile/${searchText}`)
            const searchedUser = await res.json()
            if (searchedUser.error) {
                showToast("Error", searchedUser.error, 'error')
                return
            }

            const messagingYourself = searchedUser._id === currentUser._id
            if (messagingYourself) {
                // if user is trying to search for himself
                showToast("Error", "You cannot search for yourself", 'error')
            }

            const conversationAreadyExists = conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)
            if (conversationAreadyExists) {
                // if user is already in conversations
                setSelectedConversation({
                    _id: conversationAreadyExists._id,
                    userId: searchedUser._id,
                    username: searchedUser.username,
                    userProfilePic: searchedUser.profilePic,
                })
                return
            }

            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: ""
                },
                _id: Date.now(),
                participants: [{
                    _id: searchedUser._id,
                    username: searchedUser.username,
                    profilePic: searchedUser.profilePic,
                }],
            }
            setConversations((prevConvs) => [...prevConvs, mockConversation])
        } catch (error) {
            showToast("Error", error.message, 'error')
        } finally {
            setSearchingUser(false)
        }

    }

    return (
        <Box position={'absolute'}
            left={'50%'}
            w={{ base: '100%', lg: '750px', md: '80%' }}
            transform={'translateX(-50%)'}
            p={4}
            border={'1px solid #ccc'}>
            <Flex
                gap={4}
                flexDirection={{
                    base: 'column',
                    md: 'row'
                }}
            >
                <Flex flex={30} gap={2} flexDirection={'column'} maxW={{
                    base: '250px',
                    md: 'full'
                }}>
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Conversations
                    </Text>
                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={'center'} gap={2}>
                            <Input placeholder="Search for a user" onChange={(e) => setSearchText(e.target.value)} />
                            <Button size={'sm'} onClick={handleConversationSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>

                    </form>


                    {loadingConversations && (
                        [0, 1, 2, 3, 4, 5].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={'center'} p={1} borderRadius={'md'}>
                                <Box>
                                    <SkeletonCircle size={'10'} />

                                </Box>
                                <Flex w={'full'} flexDirection={'column'} gap={4}>
                                    <Skeleton h={'10px'} w={'80px'} />
                                    <Skeleton h={'8px'} w={'90%'} />
                                </Flex>
                            </Flex>
                        ))
                    )}
                    {!loadingConversations &&
                        conversations.map((conversation) => (
                            <Conversation
                                key={conversation._id}
                                conversation={conversation}
                                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                            />
                        ))
                    }

                </Flex>
                {!selectedConversation._id && (
                    <Flex
                        flex={70}
                        borderRadius={'md'}
                        p={2}
                        flexDir={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        height={'400px'}
                    >
                        <GiConversation size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>

                    </Flex>
                )}
                {selectedConversation._id && (
                    <MessageContainer />
                )}
            </Flex>



        </Box>


    )
}

export default ChatPage