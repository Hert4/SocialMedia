import { SearchIcon } from "@chakra-ui/icons"
import { Box, Button, Input, Skeleton, SkeletonCircle, useColorModeValue } from "@chakra-ui/react"
import { Flex, Text } from "@chakra-ui/react"
// import { GiConversation } from "react-icons/gi"
import Conversation from "../components/Conversation"
import MessageContainer from "../components/MessageContainer"
import { useEffect, useState } from "react"
import useShowToast from '../hooks/useShowToast'


const ChatPage = () => {
    const showToast = useShowToast()
    const [loadingConversations, setLoadingConversations] = useState(true)
    useEffect(() => {
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


                console.log(data)

            } catch (error) {
                // console.error(error)
                showToast("Error", error.message, 'error')
            } finally {
                setLoadingConversations(false)
            }
        }

        getConversation()
    }, [showToast])


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
                    <form>
                        <Flex alignItems={'center'} gap={2}>
                            <Input placeholder="Search for a user" />
                            <Button size={'sm'}>
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
                    {!loadingConversations && <Conversation />}
                </Flex>
                {/* <Flex
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

                </Flex> */}
                <MessageContainer />
            </Flex>
        </Box>
    )
}

export default ChatPage