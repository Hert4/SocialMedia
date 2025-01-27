import { Flex, Spinner } from "@chakra-ui/react"
import { useEffect } from "react"
import useShowToast from "../hooks/useShowToast"
import { useState } from "react"
import Post from "../components/Post"
import { useRecoilState } from "recoil"
import postsAtom from "../atoms/postsAtom"

const HomePage = () => {
    const showToast = useShowToast()
    const [posts, setPosts] = useRecoilState(postsAtom)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const getFeedPosts = async () => {
            setLoading(true)
            setPosts([])
            try {
                const res = await fetch('/api/posts/feed')
                const data = await res.json()
                if (data.error) {
                    showToast("Error", data.error, "error")
                    return
                }
                console.log(data)
                setPosts(data)

            } catch (error) {
                showToast("Error", error.message, 'error')
            } finally {
                setLoading(false)
            }
        }

        getFeedPosts()
    }, [showToast, setPosts])
    return (
        <>
            {!loading && posts.length === 0 &&
                <Flex justifyContent={'center'} alignItems={'center'} mt={'300px'} flexDirection={'column'} fontWeight={'bold'}>
                    <img src="../gif/sadface.gif" width={'30%'} />
                    <h1>Nothing to see yet</h1>
                </Flex>
            }

            {loading && (
                <Flex justify={"center"}>
                    <Spinner size={'xl'} />
                </Flex>
            )}

            {posts.map((post) => (
                <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))}
        </>
    )


}

export default HomePage