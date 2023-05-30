import Icon from "./Icon";

interface SearchbarProps {
    type: "location";
    className?: string;
}

export default function Searchbar({ type, className }: SearchbarProps) {
    switch (type) {
        case "location":
            return (
                <div
                    className={`${className} flex flex-row items-center bg-zinc-300 rounded-lg px-3 h-12 shadow-sm`}
                >
                    <Icon name="search" />
                    <input className="flex-1 bg-zinc-300 outline-none ml-3 h-full" />
                </div>
            );
    }
}
