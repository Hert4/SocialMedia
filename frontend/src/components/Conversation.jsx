import {
    Avatar,
    AvatarBadge,
    Text,
    Flex,
    Stack,
    Image,
    WrapItem,
    useColorModeValue
} from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs"
import { selectedConversationAtom } from '../atoms/messagesAtom';
// import { useRecoilState, useRecoilValue } from 'recoil'


const Conversation = ({ conversation, isOnline }) => {
    const user = conversation.participants[0]
    const lastMessage = conversation.lastMessage
    const currentUser = useRecoilValue(userAtom)
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const colorMode = useColorModeValue()
    console.log("Selected Conversation: ", selectedConversation)
    return (
        <Flex
            gap={4}
            alignItems={'center'}
            p={1}
            _hover={{
                cursor: 'pointer',
                bg: useColorModeValue('gray.600', 'gray.dark'),
                color: "white"
            }}
            onClick={() => setSelectedConversation({
                _id: conversation?._id,
                userId: user?._id,
                username: user?.username,
                userProfilePic: user?.profilePic,
                mock: conversation.mock
            })}
            bg={selectedConversation._id === conversation._id ? (colorMode === 'light' ? 'gray.600' : 'gray.dark') : ""}
            borderRadius={'md'}
        >
            <WrapItem>
                <Avatar
                    size={{
                        base: 'xs',
                        sm: 'sm',
                        md: 'md'
                    }}
                    src={user?.profilePic}
                >
                    {/* <AvatarBadge boxSize="1em" bg="green.500" /> */}
                    {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
                </Avatar>
            </WrapItem>
            <Stack direction={'column'} fontSize={'sm'}>
                <Text fontWeight={700} alignItems={'center'} display={'flex'}>
                    {user?.username} <Image src='./verified.png' w={4} h={4} alt='avatar' />
                </Text>

                <Text fontSize={'xs'} display={'flex'} alignItems={'center'} gap={1}>
                    {lastMessage.sender === currentUser._id ? <BsCheck2All size={16} /> : ""}
                    {lastMessage.text.length > 18 ? lastMessage.text.substring(0, 18) + "..." : lastMessage.text}

                </Text>
            </Stack>
        </Flex>
    )
}

export default Conversation