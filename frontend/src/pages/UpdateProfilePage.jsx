import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    Avatar,
    Center,
    Box,
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";

const MotionButton = motion(Button);
const MotionStack = motion(Stack);
const MotionInput = motion(Input);
const MotionBox = motion(Box);

export default function UpdateProfilePage() {
    const [user, setUser] = useRecoilState(userAtom);
    const [inputs, setInputs] = useState({
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        password: "",
    });
    const fileRef = useRef(null);
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();
    const { handleImageChange, imgUrl } = usePreviewImg();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/users/update/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Profile updated successfully", "success");
            setUser(data);
            localStorage.setItem("user-threads", JSON.stringify(data));
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Flex align="center" justify="center" my={6} px={4}>
                <MotionStack
                    spacing={6}
                    w="full"
                    maxW="md"
                    bg={useColorModeValue("white", "gray.800")}
                    rounded="2xl"
                    boxShadow="lg"
                    p={6}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Heading
                        lineHeight={1.1}
                        fontSize={{ base: "2xl", sm: "3xl" }}
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        bgClip="text"
                    >
                        Edit Profile
                    </Heading>
                    <FormControl id="userName">
                        <Stack direction={["column", "row"]} spacing={6}>
                            <Center>
                                <MotionBox
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Avatar
                                        size="xl"
                                        boxShadow="md"
                                        src={imgUrl || user.profilePic}
                                        border="2px solid"
                                        borderColor={useColorModeValue("gray.200", "gray.600")}
                                    />
                                </MotionBox>
                            </Center>
                            <Center w="full">
                                <MotionButton
                                    w="full"
                                    bgGradient="linear(to-r, blue.400, purple.500)"
                                    color="white"
                                    rounded="full"
                                    onClick={() => fileRef.current.click()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Change Avatar
                                </MotionButton>
                                <Input type="file" hidden ref={fileRef} onChange={handleImageChange} />
                            </Center>
                        </Stack>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <MotionInput
                            placeholder="John Doe"
                            value={inputs.name}
                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                            type="text"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            rounded="lg"
                            border="none"
                            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Username</FormLabel>
                        <MotionInput
                            placeholder="johndoe"
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                            type="text"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            rounded="lg"
                            border="none"
                            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <MotionInput
                            placeholder="your-email@example.com"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                            type="email"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            rounded="lg"
                            border="none"
                            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Bio</FormLabel>
                        <MotionInput
                            placeholder="Your bio."
                            value={inputs.bio}
                            onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                            type="text"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            rounded="lg"
                            border="none"
                            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <MotionInput
                            placeholder="Password"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                            type="password"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            rounded="lg"
                            border="none"
                            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                        />
                    </FormControl>
                    <Stack spacing={6} direction={["column", "row"]}>
                        <MotionButton
                            bg="red.400"
                            color="white"
                            w="full"
                            rounded="full"
                            whileHover={{ scale: 1.05, bg: "red.500" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </MotionButton>
                        <MotionButton
                            bgGradient="linear(to-r, green.400, teal.500)"
                            color="white"
                            w="full"
                            rounded="full"
                            type="submit"
                            isLoading={updating}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Submit
                        </MotionButton>
                    </Stack>
                </MotionStack>
            </Flex>
        </form>
    );
}