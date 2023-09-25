import React, { useState } from "react";
import Typography from "./Typography";
import { useRouter } from "next/router";
import Icon from "./Icon";

interface PaginationProps {
    currentPage: number;
    maxPage: number;
}
export default function Pagination({ currentPage, maxPage }: PaginationProps) {
    const [indexes, setIndexes] = useState<number[]>([]);

    const router = useRouter();

    // inclusive
    function positiveRange(start: number, end: number) {
        var foo = [];
        for (var i = start; i <= end; i++) {
            if (i > 0) {
                foo.push(i);
            }
        }
        return foo;
    }

    async function onPageChange(newPage: number) {
        const currentQ = router.query;

        currentQ.page = String(newPage);

        await router.push(
            {
                pathname: router.pathname,
                query: currentQ,
            },
            undefined,
            {
                // I'm not sure how to show a "loading" state when getServerSideProps runs, so just do this instead and manually reload the page
                shallow: true,
                // scroll: true,
            }
        );
        router.reload();
    }

    React.useEffect(() => {
        const arrIndexes: number[] = [...positiveRange(currentPage - 3, currentPage - 1)];
        arrIndexes.push(currentPage);

        let currPageCopy = currentPage;
        while (arrIndexes.length < 7) {
            if (currPageCopy >= maxPage) {
                break;
            }
            currPageCopy++;
            arrIndexes.push(currPageCopy);
        }
        if (arrIndexes.length !== indexes.length) {
            setIndexes(arrIndexes);
        }
    }, [currentPage, maxPage]);

    return (
        <div className="flex flex-row space-x-1">
            <button
                disabled={currentPage === 1}
                className={`transition-all outline-none border-none w-10 h-10 flex items-center justify-center rounded-md ${
                    currentPage !== 1 && "hover:bg-zinc-300"
                }`}
                onClick={() => {
                    onPageChange(currentPage - 1);
                }}
            >
                <Icon
                    name="down-chevron"
                    className={`rotate-45 origin-center ${currentPage === 1 && "stroke-zinc-500"}`}
                />
            </button>
            {indexes.map((i) => {
                return (
                    <button
                        key={i}
                        disabled={currentPage === i}
                        className={`transition-all outline-none border-none w-10 h-10 flex items-center justify-center rounded-md ${
                            currentPage === i ? "bg-zinc-900 text-zinc-50" : "hover:bg-zinc-300"
                        }`}
                        onClick={() => {
                            onPageChange(i);
                        }}
                    >
                        <Typography>{i}</Typography>
                    </button>
                );
            })}
            <button
                disabled={currentPage === maxPage}
                className={`transition-all outline-none border-none w-10 h-10 flex items-center justify-center rounded-md ${
                    currentPage !== maxPage && "hover:bg-zinc-300"
                }`}
                onClick={() => {
                    onPageChange(currentPage + 1);
                }}
            >
                <Icon
                    name="down-chevron"
                    className={`-rotate-45 origin-center ${
                        currentPage === maxPage && "stroke-zinc-500"
                    }`}
                />
            </button>
        </div>
    );
}
