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
const Conversation = () => {
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
            borderRadius={'md'}
        >
            <WrapItem>
                <Avatar
                    size={{
                        base: 'xs',
                        sm: 'sm',
                        md: 'md'
                    }}
                    src='https://media.tenor.com/sbfBfp3FeY8AAAAj/oia-uia.gif'
                >
                    <AvatarBadge boxSize="1em" bg="green.500" />
                </Avatar>
            </WrapItem>
            <Stack direction={'column'} fontSize={'sm'}>
                <Text fontWeight={700} alignItems={'center'} display={'flex'}>
                    User Name <Image src='./verified.png' w={4} h={4} alt='avatar' />
                </Text>

                <Text fontSize={'sm'} display={'flex'} alignItems={'center'} gap={1}>
                    Latest Message...
                </Text>
            </Stack>
        </Flex>
    )
}

export default Conversation