import React, { useState } from "react";
import Typography from "./Typography";

interface PaginationProps {
    currentPage: number;
    maxPage: number;
    onPageChange?(newPage: number): void;
}
export default function Pagination({ currentPage, maxPage, onPageChange }: PaginationProps) {
    const [indexes, setIndexes] = useState<number[]>([]);

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
        <div className="flex flex-row space-x-2">
            {indexes.map((i) => {
                return (
                    <button
                        key={i}
                        disabled={currentPage === i}
                        className={`outline-none border-none w-10 h-10 flex items-center justify-center rounded-md ${
                            currentPage === i && "bg-zinc-900 text-zinc-50"
                        }`}
                        onClick={() => {
                            onPageChange && onPageChange(i);
                        }}
                    >
                        <Typography>{i}</Typography>
                    </button>
                );
            })}
        </div>
    );
}
