import { Work_Sans, Space_Grotesk } from "next/font/google";

const work_sans = Work_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const space_grotesk = Space_Grotesk({ subsets: ["latin"] });

export { work_sans, space_grotesk };
