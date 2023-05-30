import { Work_Sans, Poppins, Varela_Round, Space_Grotesk } from "next/font/google";

const work_sans = Work_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
const varela_round = Varela_Round({ subsets: ["latin"], weight: ["400"] });
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });

export { work_sans, poppins, varela_round, space_grotesk };
