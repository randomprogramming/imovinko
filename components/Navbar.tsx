import Icon from "./Icon";
import Searchbar from "./Searchbar";
import Button from "./Button";
import Link from "./Link";
import Modal from "./Modal";
import { useState } from "react";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";

export default function Navbar() {
    const [showLoginModel, setShowLoginModel] = useState(false);
    const [showRegisterModel, setShowRegisterModel] = useState(false);

    function openLoginForm() {
        setShowLoginModel(true);
    }

    function openRegisterForm() {
        setShowRegisterModel(true);
    }

    function closeLoginForm() {
        setShowLoginModel(false);
    }

    function closeRegisterForm() {
        setShowRegisterModel(false);
    }

    return (
        <div className="container mx-auto flex flex-row items-center my-4">
            <div>Logo</div>
            <Searchbar className="flex-1 mx-4" />
            <Modal show={showLoginModel} onClose={closeLoginForm}>
                <LoginScreen />
            </Modal>
            <Modal show={showRegisterModel} onClose={closeRegisterForm}>
                <RegisterScreen />
            </Modal>

            {/* Profile section */}
            {/* Mobile View */}
            <div className="lg:hidden">
                <Button.Transparent
                    onClick={() => {
                        console.log("clickyy");
                    }}
                >
                    <Icon name="account" height="26" width="26" />
                </Button.Transparent>
            </div>
            {/* Desktop View */}
            <div className="hidden lg:flex flex-row">
                {/* TODO: use translation*/}
                <Link onClick={openRegisterForm}>Sign Up</Link>
                <Link onClick={openLoginForm}>Log In</Link>
            </div>
            {/* Profile section end */}
        </div>
    );
}
