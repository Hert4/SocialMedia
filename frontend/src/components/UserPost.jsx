import { Box, Flex, Image, Text, } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { Avatar } from '@chakra-ui/avatar'
import Actions from "./Actions"
import { useState } from "react"
import { BsThreeDots } from "react-icons/bs"


const UserPost = ({ postImg, postTitle, likes, replies }) => {
    const [liked, setLiked] = useState(false)

    return (
        <Link to="/mark/post/1">
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={'center'}>
                    <Avatar size={'md'} name="Mark" src='/zuck-avatar.png' />
                    <Box w={'1px'} h={'full'} bg={'gray.light'} my={2}></Box>
                    <Box position={'relative'} w={'full'}>
                        <Avatar
                            size={'xs'}
                            name=""
                            src=''
                            position={'absolute'}
                            bottom={'0px'}
                            left='25px'
                            padding='2px'
                        />
                    </Box>

                </Flex>
                <Flex flex={1} flexDirection={'column'} gap={2}>
                    <Flex justifyContent={'space-between'}>
                        <Flex w={'full'} alignContent={'center'}>
                            <Text fontSize={'sm'} fontWeight={'bold'}>
                                mark
                            </Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />

                        </Flex>
                        <Flex gap={4} alignItems={'center'}>
                            <Text fontStyle={'sm'} color={'gray.light'}>
                                1d
                            </Text>
                            <BsThreeDots />
                        </Flex>
                    </Flex>
                    <Text fontStyle={'sm'}>{postTitle}</Text>
                    <Box
                        borderRadius={6}
                        overflow={'hideen'}
                        border={'1px solid'}
                        borderColor={'gray.light'}
                    >
                        <Image src={postImg} w={'full'} />
                    </Box>

                    <Flex gap={3} my={1}>
                        <Actions liked={liked} setLiked={setLiked} />
                    </Flex>

                    <Flex gap={2} alignItems={'center'}>
                        <Text color={'gray.light'} fontSize={'sm'}>{replies}</Text>
                        <Box w={0.5} h={0.5} borderRadius={'full'}></Box>
                        <Text color={'gray.light'} fontSize={'sm'}>{likes}</Text>
                    </Flex>
                </Flex>

            </Flex>
        </Link>
    )
}

export default UserPost