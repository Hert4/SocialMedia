import { Avatar, Flex, Text } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import { selectedConversationAtom } from "../atoms/messagesAtom"
import userAtom from "../atoms/userAtom"

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
                    <Text
                        maxW={"350px"}
                        bg={'blue.400'}
                        borderRadius={'md'}
                        p={1}
                    >
                        {message.text}
                    </Text>
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