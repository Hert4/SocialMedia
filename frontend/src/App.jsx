import { Box, Container, Flex } from "@chakra-ui/react"
import { Navigate, Routes, Route } from "react-router-dom"
import UserPage from "./pages/UserPage"
import PostPage from "./pages/PostPage"
import Header from "./components/Header"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import { useRecoilValue } from "recoil"
import userAtom from "./atoms/userAtom"
import UpdateProfilePage from "./pages/UpdateProfilePage"
import CreatePost from "./components/CreatePost"
import ChatPage from "./pages/ChatPage"
import AIModal from "./components/AIModel"

function App() {
  const user = useRecoilValue(userAtom)

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Header cố định ở trên cùng */}
      <Header />

      {/* Phần nội dung chính co giãn */}
      <Box flex="1" pt={{ base: "60px", md: "70px" }} pb={4}>
        <Container maxW='620px' height="100%">
          <Routes>
            <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
            <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to="/" />} />
            <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
            <Route path='/:username' element={<UserPage />} />
            <Route path='/:username/post/:pid' element={<PostPage />} />
            <Route path='/chat' element={user ? <ChatPage /> : <Navigate to='/auth' />} />
          </Routes>
        </Container>
      </Box>

      {/* Các component floating */}
      {user && <CreatePost />}
      {user && <AIModal currentUser={user} />}
    </Flex>
  )
}

export default App