import {
    Flex,
    Image,
    useColorMode,
    Link,
    Menu,
    MenuButton,
    IconButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Divider,
} from '@chakra-ui/react'
// import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { Link as RouterLink } from 'react-router-dom'
import { AiFillHome } from 'react-icons/ai'
import { RxAvatar } from 'react-icons/rx'

import { ChevronDownIcon } from '@chakra-ui/icons'
import useShowToast from '../hooks/useShowToast'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from "recoil";
import { BsFillChatQuoteFill } from 'react-icons/bs'


const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode()

    // const user = useRecoilValue(userAtom)

    // const setUser = useSetRecoilState(userAtom);
    const [user, setUser] = useRecoilState(userAtom);

    const showToast = useShowToast();
    const navigate = useNavigate()



    const menuBgColor = useColorModeValue("gray.300", "gray.700")
    const hoverBgColor = useColorModeValue("gray.400", "gray.600");


    const handleLogout = async () => {
        try {
            const res = await fetch("/api/users/logout", {
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

            localStorage.removeItem("user-threads");
            setUser(null);
            navigate("/auth")
        } catch (error) {
            showToast("Error", error, "error");
        }
    };
    return <>
        <Flex justifyContent={"space-between"} mt={6} mb="12">

            {user && (
                <Link as={RouterLink} to="/" >
                    <AiFillHome size={24} />
                </Link>
            )}
            <Image
                cursor="pointer"
                alt='logo'
                w={6}
                src={colorMode == 'dark' ? '/light-logo.svg' : '/dark-logo.svg'}
                onClick={toggleColorMode}
            />

            {/* old version */}
            {/* {user && (
                <Link as={RouterLink} to={`/${user.username}`}>
                    <RxAvatar size={24} />
                </Link>
            )} */}
            {user && (
                <Flex alignItems={'center'} gap={4}>
                    <Link as={RouterLink} to="/chat">
                        <BsFillChatQuoteFill size={20} />
                    </Link>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<RxAvatar size={24} />}
                            variant="ghost"
                            aria-label="User menu"
                        >
                            <ChevronDownIcon />
                        </MenuButton>
                        <MenuList
                            bg={menuBgColor}
                            minWidth={'140px'}
                            px={2}
                        >
                            <MenuItem
                                as={RouterLink}
                                to={`/${user.username}`}
                                bg={menuBgColor}
                                _hover={{ bg: hoverBgColor }}
                                margin={0}

                            >
                                Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem
                                onClick={handleLogout}
                                bg={menuBgColor}
                                _hover={{ bg: hoverBgColor }}
                                margin={0}
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            )}

        </Flex>
    </>
}

export default Header