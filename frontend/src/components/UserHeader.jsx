import { Box, Flex, Text, VStack, Link } from "@chakra-ui/react";
import { Avatar, useToast } from "@chakra-ui/react";
import { BsInstagram } from 'react-icons/bs'
import { CgMore } from 'react-icons/cg'
import { Button, Menu, MenuButton, MenuItem, MenuList, Portal } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react';
import userAtom from '../atoms/userAtom'
import { useRecoilValue } from 'recoil'
import { Link as RouterLink } from 'react-router-dom'
import { useState } from 'react'
import useShowToast from '../hooks/useShowToast'
const UserHeader = ({ user }) => {

    const toast = useToast()
    const currentUser = useRecoilValue(userAtom) //logged user

    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id))
    console.log(following)

    const copyURL = () => {
        const currentURL = window.location.href
        navigator.clipboard.writeText(currentURL).then(() => {
            console.log("URL copies to the clipboard")
            toast({
                title: "Success",
                status: "success",
                description: "Copied profile to clipboard",
                duration: 3000,
                isClosable: true,
            })
        })
    }
    const [updating, setUpdating] = useState(false)
    const showToast = useShowToast()
    const handleFollowUnfollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login to follow", 'error')
            return
        }
        if (updating) return
        setUpdating(true)
        try {
            const res = await fetch(`api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await res.json()
            console.log(data)
            if (data.error) {
                showToast("Error", data.error, "error")
                return
            }

            if (following) {
                showToast("Success", `Unfollowed ${user.name}`, "success")
                user.followers.pop() //update in client side
            } else {
                showToast("Success", `Followed ${user.name}`, "success")
                user.followers.push(currentUser?._id) //update in client side
            }
            setFollowing(!following)

        } catch (error) {
            showToast("Error", error, "error")
        } finally {
            setUpdating(false)
        }
    }
    return <VStack gap={4} alignItems={'stsart'}>
        <Flex justifyContent={'space-between'} w='full' alignContent={'center'}>
            <Box>
                <Text fontSize={'2xl'} fontWeight={'bold'}>{user.name}</Text>
                <Flex gap={2} alignItems={'center'}>
                    <Text fontSize={"sm"}>{user.username}</Text>
                    <Text fontSize={{
                        base: 'xs',
                        md: 'sm',
                        lg: 'md',
                    }} bg={"gray.dark"} color={'white'} p={1} borderRadius={'full'}>
                        thresh.net
                    </Text>
                </Flex>
            </Box>
            <Box>

                {user.profilePic && (<Avatar
                    name={user.name}
                    src={user.profilePic}
                    // tương thích với các thiết bị khác
                    size={{
                        base: 'md',
                        md: 'xl'
                    }}
                />)}
                {!user.profilePic && (<Avatar
                    name={user.name}
                    src='https://bit-ly/broken-link'
                    // tương thích với các thiết bị khác
                    size={{
                        base: 'md',
                        md: 'xl'
                    }}
                />)}
            </Box>
        </Flex>
        <Text>{user.bio}</Text>
        {currentUser?._id === user._id && (
            <Link as={RouterLink} to='/update'>
                <Button size={'sm'}> Update profile</Button>
            </Link>
        )}

        {currentUser?._id !== user._id && (
            <Button size={'sm'} onClick={handleFollowUnfollow} isLoading={updating}>{following ? "Unfollow" : "Follow"}</Button>
        )}

        <Flex w={"full"} justifyContent={"space-between"}>
            <Flex gap={2} alignItems={"center"}>
                <Text color={'gray.light'}>{user.followers.length} followers</Text>
                <Box w={1} h={1} bg={'gray.light'} borderRadius={'full'}></Box>
                <Link color={'gray.light'}>instagram.com</Link>
            </Flex>
            <Flex>
                <Box className='icon-container'>
                    <BsInstagram size={24} cursor={'pointer'} />
                </Box>
                <Box className='icon-container'>
                    <Menu>
                        <MenuButton>

                            <CgMore size={24} cursor={'pointer'} />
                        </MenuButton>
                        <Portal>
                            <MenuList bg={"gray.dark"}>
                                <MenuItem bg={'gray.dark'} color={"white"} onClick={copyURL}>Copy Link</MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>

                </Box>
            </Flex>

        </Flex>

        <Flex w={'full'}>
            <Flex flex={1}
                borderBottom={`1.5px solid ${useColorModeValue('black', 'white')}`}
                justifyContent={'center'}
                pb={3}
                cursor={'pointer'}>
                <Text fontWeight={"bold"}>Threads</Text>
            </Flex>
            <Flex flex={1}
                borderBottom={`1.5px solid ${useColorModeValue('gray', 'gray')}`}
                justifyContent={'center'}
                pb={3}
                color={'gray.light'}
                cursor={'pointer'}>
                <Text fontWeight={"bold"}>Replies</Text>
            </Flex>
        </Flex>
    </VStack>
}

export default UserHeader