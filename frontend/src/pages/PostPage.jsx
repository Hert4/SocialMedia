import { Avatar, Flex, Image, Text, Box, Divider, Button, Spinner, useColorModeValue } from "@chakra-ui/react";
import { motion } from 'framer-motion';
import Actions from "../components/Actions";
import { useEffect } from 'react';
import Comment from "../components/Comment";
import useShowToast from "../hooks/useShowToast";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from '@chakra-ui/icons';
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionText = motion(Text);

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const currentPost = posts[0];

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, 'error');
        }
        setPosts([data]);
      } catch (error) {
        showToast("Error", error.message, 'error');
      }
    };
    getPost();
  }, [showToast, pid, setPosts]);

  if (!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );
  }
  if (!currentPost) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue("white", "gray.800")}
      rounded="2xl"
      p={4}
      shadow="lg"
    >
      <MotionFlex
        w="full"
        alignItems="center"
        gap={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Avatar src={user.profilePic} size="md" name={user.username} />
        </MotionBox>
        <Flex>
          <Text fontSize="sm" fontWeight="bold">{user.username}</Text>
          <Image src="/verified.png" w={4} h={4} ml={2} />
        </Flex>
        <Flex gap={4} alignItems="center" ml="auto">
          <Text fontSize="xs" color="gray.500">
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>
          {currentUser?._id === user._id && (
            <MotionBox whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <DeleteIcon size={20} onClick={handleDeletePost} cursor="pointer" color="red.400" />
            </MotionBox>
          )}
        </Flex>
      </MotionFlex>

      <MotionText
        my={3}
        fontSize="md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentPost.text}
      </MotionText>

      {currentPost.img && (
        <MotionBox
          borderRadius={12}
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Image src={currentPost.img} w="full" />
        </MotionBox>
      )}

      <MotionFlex
        gap={3}
        my={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Actions post={currentPost} />
      </MotionFlex>

      <Divider my={4} />

      <MotionFlex
        justifyContent="space-between"
        alignItems="center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Flex gap={2} alignItems="center">
          <Text fontSize="2xl">💬</Text>
          <Text color="gray.500" fontSize="sm">Get the app to like, reply, and post...</Text>
        </Flex>
        <MotionButton
          size="sm"
          bgGradient="linear(to-r, blue.400, purple.500)"
          color="white"
          rounded="full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get
        </MotionButton>
      </MotionFlex>

      <Divider my={4} />

      {currentPost.replies.map((reply, index) => (
        <MotionBox
          key={reply._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
        >
          <Comment
            reply={reply}
            lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
          />
        </MotionBox>
      ))}
    </MotionBox>
  );
};

export default PostPage;