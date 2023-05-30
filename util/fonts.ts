import { Work_Sans, Poppins, Varela_Round } from "next/font/google";

const work_sans = Work_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
const varela_round = Varela_Round({ subsets: ["latin"], weight: ["400"] });

export { work_sans, poppins, varela_round };
