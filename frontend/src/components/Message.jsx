import { Avatar, Box, Flex, Text } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import { selectedConversationAtom } from "../atoms/messagesAtom"
import userAtom from "../atoms/userAtom"
import { BsCheck2All } from 'react-icons/bs'

const Message = ({ ownMessage, message }) => {
    const selectedConversation = useRecoilValue(selectedConversationAtom)
    const user = useRecoilValue(userAtom)
    console.log("USER: ", user)
    return (
        <>
            {ownMessage ? (
                <Flex
                    gap={2}
                    alignSelf={'flex-end'}

                >
                    <Box alignSelf={'flex-end'} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={'bold'}>
                        <BsCheck2All size={16} />
                    </Box>
                    <Text
                        maxW={"350px"}
                        bg={'blue.400'}
                        borderRadius={'md'}
                        p={1}
                    >
                        {message.text}

                    </Text>


                    <Flex
                        gap={2}
                        alignSelf={'center'}>

                    </Flex>
                    <Avatar src={user?.profilePic || ''} w={7} h={8} />
                </Flex >

            ) : (
                <Flex
                    gap={2}
                >
                    <Avatar
                        src={selectedConversation?.userProfilePic || ''}
                        w={7} h={8}
                    />
                    <Text
                        maxW={"350px"}
                        bg={'gray.400'}
                        borderRadius={'md'}
                        p={1}
                        color={"black"}
                    >
                        {message.text}
                    </Text>

                </Flex >
            )}
        </>


    )
}

export default Message