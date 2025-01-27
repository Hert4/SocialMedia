import { Avatar, Flex, Text } from "@chakra-ui/react"

const Message = ({ ownMessage }) => {
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
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad aliquam vitae vero sint quas quam ab rem, deserunt eius molestias repudiandae totam optio itaque. Distinctio tempora autem ipsum quisquam ad.
                    </Text>
                    <Avatar src="" w={7} h={8} />
                </Flex >

            ) : (
                <Flex
                    gap={2}
                >
                    <Avatar src="" w={7} h={8} />
                    <Text
                        maxW={"350px"}
                        bg={'gray.400'}
                        borderRadius={'md'}
                        p={1}
                        color={"black"}
                    >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad aliquam vitae vero sint quas quam ab rem, deserunt eius molestias repudiandae totam optio itaque. Distinctio tempora autem ipsum quisquam ad.
                    </Text>

                </Flex >
            )}
        </>


    )
}

export default Message