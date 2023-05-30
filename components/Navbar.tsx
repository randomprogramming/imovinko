import Icon from "./Icon";
import Searchbar from "./Searchbar";
import Button from "./Button";

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
                {/* TODO: use translation, create a link component, and create a Typography 
                 component which uses fonts */}
                <div>T:Sign Up</div>
                <div>T:Log In</div>
            </div>
            {/* Profile section end */}
        </div>
    );
}
