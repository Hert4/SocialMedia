import { Box, Flex, Text, VStack, Link, Avatar, useToast, Button, Menu, MenuButton, MenuItem, MenuList, Portal } from "@chakra-ui/react";
import { CgMore } from 'react-icons/cg';
import { motion } from 'framer-motion';
import { useColorModeValue } from '@chakra-ui/react';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import useShowToast from '../hooks/useShowToast';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const UserHeader = ({ user }) => {
    const toast = useToast();
    const currentUser = useRecoilValue(userAtom); // logged user
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();

    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            toast({
                title: "Success",
                status: "success",
                description: "Copied profile to clipboard",
                duration: 3000,
                isClosable: true,
            });
        });
    };

    const handleFollowUnfollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login to follow", 'error');
            return;
        }
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            if (following) {
                showToast("Success", `Unfollowed ${user.name}`, "success");
                user.followers.pop();
            } else {
                showToast("Success", `Followed ${user.name}`, "success");
                user.followers.push(currentUser?._id);
            }
            setFollowing(!following);
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <VStack gap={4} alignItems="start" px={4} py={6} bg={useColorModeValue("white", "gray.800")} rounded="2xl" shadow="lg">
            <Flex justifyContent="space-between" w="full" alignItems="center">
                <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Text fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems="center">
                        <Text fontSize="sm" color="gray.500">@{user.username}</Text>
                    </Flex>
                </MotionBox>
                <MotionBox
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Avatar
                        name={user.name}
                        src={user.profilePic || 'https://bit-ly/broken-link'}
                        size={{ base: 'md', md: 'xl' }}
                        border="2px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                    />
                </MotionBox>
            </Flex>
            <Text color="gray.600" fontSize="sm">{user.bio}</Text>
            <Flex w="full" gap={2}>
                {currentUser?._id === user._id && (
                    <Link as={RouterLink} to="/update">
                        <MotionButton
                            size="sm"
                            bgGradient="linear(to-r, blue.400, purple.500)"
                            color="white"
                            rounded="full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Update Profile
                        </MotionButton>
                    </Link>
                )}
                {currentUser?._id !== user._id && (
                    <MotionButton
                        size="sm"
                        bgGradient={following ? "linear(to-r, gray.400, gray.500)" : "linear(to-r, blue.400, purple.500)"}
                        color="white"
                        rounded="full"
                        onClick={handleFollowUnfollow}
                        isLoading={updating}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {following ? "Unfollow" : "Follow"}
                    </MotionButton>
                )}
            </Flex>
            <Flex w="full" justifyContent="space-between" alignItems="center">
                <Flex gap={2} alignItems="center">
                    <Text color="gray.500" fontSize="sm">{user.followers.length} followers</Text>
                </Flex>
                <MotionBox whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                    <Menu>
                        <MenuButton>
                            <CgMore size={24} cursor="pointer" />
                        </MenuButton>
                        <Portal>
                            <MenuList bg={useColorModeValue("white", "gray.700")} shadow="md" rounded="lg" p={2}>
                                <MenuItem
                                    bg="transparent"
                                    color={useColorModeValue("gray.800", "white")}
                                    onClick={copyURL}
                                    rounded="md"
                                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                >
                                    Copy Link
                                </MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                </MotionBox>
            </Flex>
            <Flex w="full" borderTop="1px solid" borderColor={useColorModeValue("gray.200", "gray.600")} pt={2}>
                <MotionBox
                    flex={1}
                    borderBottom="2px solid"
                    borderColor={useColorModeValue("blue.400", "purple.500")}
                    textAlign="center"
                    py={2}
                    cursor="pointer"
                    whileHover={{ scale: 1.05 }}
                >
                    <Text fontWeight="bold" color={useColorModeValue("blue.400", "purple.500")}>Posts</Text>
                </MotionBox>
            </Flex>
        </VStack>
    );
};

export default UserHeader;