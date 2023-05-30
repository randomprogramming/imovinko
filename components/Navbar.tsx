import Searchbar from "./Searchbar";

export default function Navbar() {
    return (
        <div className="container mx-auto flex flex-row items-center my-4">
            <div>Logo</div>
            <Searchbar type="location" className="flex-1 mx-4" />
        </div>
    );
}
