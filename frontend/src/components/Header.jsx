import {
    Flex,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useColorMode,
    useColorModeValue,
    Divider,
    Box,
    useBreakpointValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import { useNavigate } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'
import {
    IoSunnyOutline,
    IoMoonOutline,
    IoHomeOutline,
    IoHome,
    IoPersonOutline,
    IoPerson,
    IoChatbubbleOutline,
    IoLogOutOutline
} from 'react-icons/io5'

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode()
    const [user, setUser] = useRecoilState(userAtom)
    const navigate = useNavigate()
    const showToast = useShowToast()

    // iOS Color Palette
    const iosLightBg = "rgba(249, 249, 249, 0.8)"
    const iosDarkBg = "rgba(28, 28, 30, 0.8)"
    const iosLightBorder = "rgba(0, 0, 0, 0.1)"
    const iosDarkBorder = "rgba(255, 255, 255, 0.1)"
    const iosLightText = "rgba(0, 0, 0, 0.85)"
    const iosDarkText = "rgba(255, 255, 255, 0.85)"
    const iosLightHover = "rgba(0, 0, 0, 0.03)"
    const iosDarkHover = "rgba(255, 255, 255, 0.03)"
    const iosBlue = "#007AFF" // Màu hệ thống iOS

    const headerBg = useColorModeValue(iosLightBg, iosDarkBg)
    const borderColor = useColorModeValue(iosLightBorder, iosDarkBorder)
    const iconColor = useColorModeValue(iosLightText, iosDarkText)
    const hoverBgColor = useColorModeValue(iosLightHover, iosDarkHover)
    const menuBgColor = useColorModeValue(iosLightBg, iosDarkBg)
    const activeColor = useColorModeValue("rgba(0, 122, 255, 0.1)", "rgba(10, 132, 255, 0.1)")

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            const data = await res.json()

            if (data.error) {
                showToast("Error", data.error, "error")
                return
            }

            localStorage.removeItem("user-threads")
            setUser(null)
            navigate("/auth")
        } catch (error) {
            showToast("Error", error, "error")
        }
    }

    return (
        <Box
            as="header"
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="sticky"
            bg={headerBg}
            backdropFilter="blur(20px)"
            px={4}
            py={2}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            height="60px"
        >
            <Flex justify="space-between" align="center" maxW="620px" mx="auto" height="100%">
                {user && (
                    <Link as={RouterLink} to="/">
                        <IconButton
                            aria-label="Home"
                            icon={colorMode === 'light' ? <IoHomeOutline size={24} /> : <IoHome size={24} />}
                            variant="ghost"
                            color={iconColor}
                            _hover={{ bg: hoverBgColor }}
                            _active={{ bg: activeColor }}
                            borderRadius="full"
                            size="lg"
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        />
                    </Link>
                )}

                <IconButton
                    aria-label="Toggle color mode"
                    icon={colorMode === 'light' ? <IoMoonOutline size={20} /> : <IoSunnyOutline size={20} />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    color={iconColor}
                    _hover={{ bg: hoverBgColor }}
                    _active={{ bg: activeColor }}
                    borderRadius="full"
                    size="lg"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                />

                {user && (
                    <Flex align="center" gap={2}>
                        <Link as={RouterLink} to="/chat">
                            <IconButton
                                aria-label="Chat"
                                icon={<IoChatbubbleOutline size={22} />}
                                variant="ghost"
                                color={iconColor}
                                _hover={{ bg: hoverBgColor }}
                                _active={{ bg: activeColor }}
                                borderRadius="full"
                                size="lg"
                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                        </Link>

                        <Menu>
                            <MenuButton
                                as={IconButton}
                                icon={<IoPersonOutline size={24} />}
                                variant="ghost"
                                color={iconColor}
                                _hover={{ bg: hoverBgColor }}
                                _active={{ bg: activeColor }}
                                borderRadius="full"
                                size="lg"
                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                            <MenuList
                                bg={menuBgColor}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={borderColor}
                                boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                                py={1}
                                minWidth="180px"
                            >
                                <MenuItem
                                    as={RouterLink}
                                    to={`/${user.username}`}
                                    _hover={{ bg: hoverBgColor }}
                                    _active={{ bg: activeColor }}
                                    icon={<IoPersonOutline size={18} />}
                                    fontSize="14px"
                                    fontWeight="500"
                                    color={iconColor}
                                >
                                    Profile
                                </MenuItem>
                                <Divider my={1} borderColor={borderColor} />
                                <MenuItem
                                    onClick={handleLogout}
                                    _hover={{ bg: hoverBgColor }}
                                    _active={{ bg: activeColor }}
                                    icon={<IoLogOutOutline size={18} />}
                                    fontSize="14px"
                                    fontWeight="500"
                                    color={iconColor}
                                >
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                )}
            </Flex>
        </Box>
    )
}

export default Header