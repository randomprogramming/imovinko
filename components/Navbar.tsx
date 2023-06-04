import Icon from "./Icon";
import Searchbar from "./Searchbar";
import Button from "./Button";
import Link from "./Link";

export default function Navbar() {
    return (
        <div className="container mx-auto flex flex-row items-center my-4">
            <div>Logo</div>
            <Searchbar className="flex-1 mx-4" />

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
                <Link to="/register">Sign Up</Link>
                <Link to="/login">Log In</Link>
            </div>
            {/* Profile section end */}
        </div>
    );
}
