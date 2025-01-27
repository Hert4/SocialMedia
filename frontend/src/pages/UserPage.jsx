import { useParams } from "react-router-dom"
import UserHeader from "../components/UserHeader"
import { useEffect, useState } from "react"
import useShowToast from "../hooks/useShowToast"
import { Flex, Spinner } from "@chakra-ui/react"
import Post from "../components/Post"
import useGetUserProfile from "../hooks/useGetUserProfile"
import { useRecoilState } from "recoil"
import postsAtom from "../atoms/postsAtom"


const UserPage = () => {
  const { user, loading } = useGetUserProfile()
  const { username } = useParams()
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [fetchingPosts, setFetchingPosts] = useState(true)
  useEffect(() => {
    const getPosts = async () => {
      setFetchingPosts(true)
      try {
        const res = await fetch(`/api/posts/user/${username}`)
        const data = await res.json()

        console.log(data)

        setPosts(data)
      } catch (error) {
        showToast("Error", error.message, 'error')
      } finally {
        setFetchingPosts(false)
      }
    }

    getPosts()
  }, [username, showToast, setPosts])
  console.log("Here is the state of posts", posts)
  if (!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!user && !loading) return <h1>User not found</h1>
  if (!user) return null
  return <>
    <UserHeader user={user} />
    {!fetchingPosts && posts.length == 0 &&
      <Flex justifyContent={'center'} alignItems={'center'} mt={'20px'} flexDirection={'column'} fontWeight={'bold'}>
        <img src="../gif/sadface.gif" width={'20%'} />
        <h1>This user doesn&apos;t have a post yet!</h1>
      </Flex>
    }
    {fetchingPosts && (
      <Flex justifyContent={"center"} my={12}>
        <Spinner size={"xl"} />
      </Flex>
    )}

    {posts.map((post) =>
      <Post key={post._id} post={post} postedBy={post.postedBy} />
    )}
  </>
}

export default UserPage