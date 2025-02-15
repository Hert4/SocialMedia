import { Box, Flex, Image, Text, } from "@chakra-ui/react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar } from "@chakra-ui/react";
import Actions from "./Actions"
import { useEffect, useState } from "react"
// import { BsThreeDots } from "react-icons/bs"
import useShowToast from "../hooks/useShowToast"
import { formatDistanceToNow } from "date-fns"
import { DeleteIcon } from '@chakra-ui/icons'
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import postsAtom from "../atoms/postsAtom"
const Post = ({ post, postedBy }) => {
    // const [liked, setLiked] = useState(false)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const currentUser = useRecoilValue(userAtom)
    const [posts, setPosts] = useRecoilState(postsAtom)
    const showToast = useShowToast()


    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/${postedBy}`)
                const data = await res.json()

                console.log(data)
                if (data.error) {
                    showToast("Error", data.error, 'error')
                    return
                }
                setUser(data)
            } catch (error) {
                showToast("Error", error.message, "error")
                setUser(null)
            }
        }
        getUser()
    }, [postedBy, showToast])

    const handleDeletePost = async (e) => {
        try {
            e.preventDefault()
            if (!window.confirm("Are you sure you want to delete this post ?")) return
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (data.error) {
                showToast("Error", data.error, "error")
                return
            }

            showToast("Success", "Post deleted", "success")
            setPosts(posts.filter((p) => p._id !== post._id))
        } catch (error) {
            showToast("Error", error.message, "error")
        }
    }
    if (!user) return null
    return (
        <Link to={`/${user?.username}/post/${post._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={'center'}>
                    <Avatar size={'md'} name={user?.name} src={user?.profilePic} onClick={(e) => {
                        e.preventDefault()
                        navigate(`/${user?.username}`)
                    }} />
                    <Box w={'1px'} h={'full'} bg={'gray.light'} my={2}></Box>
                    <Box position={'relative'} w={'full'}>
                        {post.replies.length === 0 && <Text align={"center"}>...</Text>}
                        {post.replies[0] && (
                            <Avatar
                                size={'xs'}
                                name={post.replies[0].username}
                                src={post.replies[0].userProfilePic}
                                position={'absolute'}
                                top={'0px'}
                                left='15px'
                                padding='2px'
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/${post.replies[0].username}`)
                                }}
                            />
                        )}

                        {post.replies[1] && (
                            <Avatar
                                size={'xs'}
                                name={post.replies[1].username}
                                src={post.replies[1].userProfilePic}
                                position={'absolute'}
                                bottom={'0px'}
                                right='-5px'
                                padding='2px'
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/${post.replies[1].username}`)
                                }}
                            />
                        )}
                        {post.replies[2] && (
                            <Avatar
                                size={'xs'}
                                name={post.replies[2].username}
                                src={post.replies[2].userProfilePic}
                                position={'absolute'}
                                bottom={'0px'}
                                left='4px'
                                padding='2px'
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/${post.replies[2].username}`)
                                }}
                            />
                        )}
                    </Box>

                </Flex>
                <Flex flex={1} flexDirection={'column'} gap={2}>
                    <Flex justifyContent={'space-between'}>
                        <Flex w={'full'} alignContent={'center'}>
                            <Text fontSize={'sm'} fontWeight={'bold'}
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/${user?.username}`)
                                }}>
                                {user?.username}
                            </Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />

                        </Flex>
                        <Flex gap={4} alignItems={'center'}>
                            <Text fontStyle={'xs'} width={36} align={'right'} color={'gray.light'}>
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                            </Text>
                            {currentUser?._id === user._id && (
                                <DeleteIcon size={20} onClick={handleDeletePost} />
                            )}

                        </Flex>
                    </Flex>
                    <Text fontStyle={'sm'}>{post.text}</Text>
                    {post.img && (
                        <Box
                            borderRadius={6}
                            overflow={'hideen'}
                            border={'1px solid'}
                            borderColor={'gray.light'}
                        >
                            <Image src={post.img} w={'full'} />
                        </Box>
                    )}


                    <Flex gap={3} my={1}>
                        <Actions post={post} />
                    </Flex>


                </Flex>

            </Flex>
        </Link>
    )
}

export default Post