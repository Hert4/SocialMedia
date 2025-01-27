import { Button } from "@chakra-ui/button";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";

const LogoutButton = () => {
    const logout = useLogout()

    return (
        <Button position={"fixed"} top={"30px"} right={"30px"} size={"sm"} onClick={logout}>
            <FiLogOut size={20} />
        </Button>
    );
};

export default LogoutButton;