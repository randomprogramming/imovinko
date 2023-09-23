import React, { useEffect, useRef } from "react";

// Same as useeffect except it DOESN'T run on initial component render
const useDidMountEffect = (func: () => void, deps: any[]) => {
    const didMount = useRef(false);

    useEffect(() => {
        console.log("renderish");

        if (didMount.current) func();
        else didMount.current = true;
    }, deps);
};

export default useDidMountEffect;
