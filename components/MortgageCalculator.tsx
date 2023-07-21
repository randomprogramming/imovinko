import React, { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field";
import Typography from "./Typography";
import { space_grotesk } from "@/util/fonts";
import Slider from "react-slider";
import { ResponsivePie } from "@nivo/pie";
import { useTranslations } from "next-intl";

// This component has to be imported as such for some reason, nivo doesn't play nice with nextjs, idk:
// import dynamic from "next/dynamic";
// const MortgageCalculator = dynamic(() => import("@/components/MortgageCalculator"), { ssr: false });

const MIN_LOAN_AMOUNT = 10_000;
const MAX_LOAN_AMOUNT = 1_000_000;
const MIN_LOAN_LENGTH_MONTHS = 36;
const MAX_LOAN_LENGTH_MONTHS = 360;
const MIN_LOAN_INTEREST_RATE = 1;
const MAX_LOAN_INTEREST_RATE = 10;

export function toTwoDecimals(num: string) {
    if (!num.includes(".")) {
        return `${num}.00`;
    }
    const numSplit = num.split(".");
    numSplit[1] = numSplit[1].padEnd(2, "0");
    return numSplit.join(".");
}

export function round(num: number) {
    return Math.round(num * 100) / 100;
}

export function calculateMonthlyPayment(
    loan: number,
    interestRate: number,
    loanLengthMonths: number
) {
    // Formula:
    // a=K((r^n*(r-1))/(r^n-1))
    // Where:
    // a-monthly payment
    // K-total loan amount
    // p-interest rate
    // pm-interest rate monthly
    // pm=p/12
    // r-decursive loan factor (hrv. dekurzivni kamatni faktor)
    // r=1+pm/100
    // n-loan length in months
    const pm = interestRate / 12;
    const r = 1 + pm / 100;
    const a =
        loan * ((Math.pow(r, loanLengthMonths) * (r - 1)) / (Math.pow(r, loanLengthMonths) - 1));
    return a;
}

export function calculateTotalInterestPaid(
    loan: number,
    monthlyPayment: number,
    loanLengthMonths: number
) {
    return monthlyPayment * loanLengthMonths - loan;
}

interface MortgageCalculatorProps {
    initialLoanValue?: number;
}
export default function MortgageCalculator({ initialLoanValue }: MortgageCalculatorProps) {
    const t = useTranslations("Calculator");

    const [totalLoanAmount, setTotalLoanAmount] = useState(initialLoanValue || 150000);
    const [interestRate, setInterestRate] = useState(3.75);
    const [loanLengthMonths, setLoanLengthMonths] = useState(240);

    const [monthlyPayment, setMonthlyPayment] = useState(
        calculateMonthlyPayment(totalLoanAmount, interestRate, loanLengthMonths)
    );
    const [totalInterestPaid, setTotalInterestPaid] = useState(
        calculateTotalInterestPaid(totalLoanAmount, monthlyPayment, loanLengthMonths)
    );

    const [totalLoanAmountInputValue, setTotalLoanAmountInputValue] = useState<string>(
        String(totalLoanAmount)
    );
    const [loanLengthMonthsInputValue, setLoanLengthMonthsInputValue] = useState<string>(
        String(loanLengthMonths)
    );
    const [interestRateInputValue, setInterestRateInputValue] = useState<string>(
        String(interestRate)
    );

    function handleTotalLoanAmountInputChange(newVal: string | undefined) {
        setTotalLoanAmountInputValue(newVal || "");

        if (isNaN(newVal as any)) {
            return;
        }
        const newValNumber = Number(newVal);
        if (newValNumber >= MIN_LOAN_AMOUNT && newValNumber <= MAX_LOAN_AMOUNT) {
            setTotalLoanAmount(newValNumber);
        }
    }

    function handleTotalLoanSliderChange(newVal: number) {
        setTotalLoanAmountInputValue(String(newVal));
        if (newVal >= MIN_LOAN_AMOUNT && newVal <= MAX_LOAN_AMOUNT) {
            setTotalLoanAmount(newVal);
        }
    }

    function handleLoanLengthMonthsInputChange(newVal: string) {
        setLoanLengthMonthsInputValue(newVal);

        if (isNaN(newVal as any)) {
            return;
        }
        const newValNumber = Number(newVal);
        if (newValNumber >= MIN_LOAN_LENGTH_MONTHS && newValNumber <= MAX_LOAN_LENGTH_MONTHS) {
            setLoanLengthMonths(newValNumber);
        }
    }

    function handleLoanLengthMonthsSliderChange(newVal: number) {
        setLoanLengthMonthsInputValue(String(newVal));
        if (newVal >= MIN_LOAN_LENGTH_MONTHS && newVal <= MAX_LOAN_LENGTH_MONTHS) {
            setLoanLengthMonths(newVal);
        }
    }

    function handleInterestRateInputChange(newVal: string) {
        setInterestRateInputValue(newVal);

        if (isNaN(newVal as any)) {
            return;
        }

        const newValNumber = Number(newVal);
        if (newValNumber >= MIN_LOAN_INTEREST_RATE && newValNumber <= MAX_LOAN_INTEREST_RATE) {
            setInterestRate(newValNumber);
        }
    }

    function handleInterestRateSliderChange(newVal: number) {
        let strInterestRate = String(newVal);
        if (!strInterestRate.includes(".")) {
            strInterestRate += ".";
        }

        strInterestRate = toTwoDecimals(strInterestRate);
        setInterestRateInputValue(strInterestRate);
        if (newVal >= MIN_LOAN_INTEREST_RATE && newVal <= MAX_LOAN_INTEREST_RATE) {
            setInterestRate(newVal);
        }
    }

    useEffect(() => {
        setMonthlyPayment(calculateMonthlyPayment(totalLoanAmount, interestRate, loanLengthMonths));
    }, [totalLoanAmount, interestRate, loanLengthMonths]);

    useEffect(() => {
        setTotalInterestPaid(
            calculateTotalInterestPaid(totalLoanAmount, monthlyPayment, loanLengthMonths)
        );
    }, [totalLoanAmount, monthlyPayment, loanLengthMonths]);

    return (
        <div
            className="w-full flex flex-col lg:flex-row justify-center"
            style={{
                minHeight: "333px",
            }}
        >
            <div className="lg:w-1/3">
                <div>
                    <Typography>{t("loan-amount")}</Typography>
                    <CurrencyInput
                        className={`${space_grotesk.className} text-blue-500 bg-transparent py-1 rounded-md font-bold`}
                        value={totalLoanAmountInputValue}
                        decimalsLimit={2}
                        intlConfig={{
                            locale: "hr",
                            currency: "EUR",
                        }}
                        onValueChange={(value) => handleTotalLoanAmountInputChange(value)}
                    />
                    <Slider
                        className="mb-4"
                        trackClassName="bg-blue-500 mortgage-calculator-track"
                        renderThumb={(props) => (
                            <div
                                {...props}
                                className="w-5 h-5 rounded-full bg-blue-500 outline-none border-none flex items-center justify-center shadow-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-zinc-50"></div>
                            </div>
                        )}
                        min={MIN_LOAN_AMOUNT}
                        max={MAX_LOAN_AMOUNT}
                        step={500}
                        value={totalLoanAmount}
                        onChange={handleTotalLoanSliderChange}
                    />
                </div>

                <div className="mt-12">
                    <Typography>{t("loan-length")}</Typography>
                    <input
                        className={`${space_grotesk.className} text-blue-500 bg-transparent py-1 rounded-md font-bold`}
                        value={loanLengthMonthsInputValue}
                        onChange={(e) => {
                            handleLoanLengthMonthsInputChange(e.target.value);
                        }}
                    />
                    <Slider
                        className="mb-4"
                        trackClassName="bg-blue-500 mortgage-calculator-track"
                        renderThumb={(props) => (
                            <div
                                {...props}
                                className="w-5 h-5 rounded-full bg-blue-500 outline-none border-none flex items-center justify-center shadow-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-zinc-50"></div>
                            </div>
                        )}
                        min={MIN_LOAN_LENGTH_MONTHS}
                        max={MAX_LOAN_LENGTH_MONTHS}
                        step={1}
                        value={loanLengthMonths}
                        withTracks
                        onChange={handleLoanLengthMonthsSliderChange}
                    />
                </div>

                <div className="mt-12">
                    <Typography>{t("interest-rate")}</Typography>
                    <input
                        className={`${space_grotesk.className} text-blue-500 bg-transparent py-1 rounded-md font-bold`}
                        value={interestRateInputValue}
                        onChange={(e) => {
                            handleInterestRateInputChange(e.target.value);
                        }}
                    />
                    <Slider
                        className="mb-4"
                        trackClassName="bg-blue-500 mortgage-calculator-track"
                        renderThumb={(props) => (
                            <div
                                {...props}
                                className="w-5 h-5 rounded-full bg-blue-500 outline-none border-none flex items-center justify-center shadow-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-zinc-50"></div>
                            </div>
                        )}
                        min={MIN_LOAN_INTEREST_RATE}
                        max={MAX_LOAN_INTEREST_RATE}
                        step={0.01}
                        value={interestRate}
                        withTracks
                        onChange={handleInterestRateSliderChange}
                    />
                </div>
            </div>

            <div className="lg:w-1/3">
                <Typography className="text-center">Mjesecna rata</Typography>
                <Typography className="text-blue-500 text-2xl text-center" bold>
                    {toTwoDecimals(round(monthlyPayment).toLocaleString())} €
                </Typography>
            </div>
            <div className="lg:w-1/3">
                <div className="w-full h-full relative">
                    <div className="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center">
                        <div>
                            <Typography bold className="text-center">
                                {round(totalInterestPaid + totalLoanAmount).toLocaleString()} €
                            </Typography>
                            <Typography sm className="text-center">
                                {t("total-to-pay")}
                            </Typography>
                        </div>
                    </div>
                    <ResponsivePie
                        data={[
                            {
                                id: t("interest-paid"),
                                label: t("interest-paid"),
                                value: totalInterestPaid.toFixed(2),
                            },
                            {
                                id: t("loan-amount"),
                                label: t("loan-amount"),
                                value: totalLoanAmount.toFixed(2),
                            },
                        ]}
                        margin={{ bottom: 25 }}
                        innerRadius={0.6}
                        padAngle={0.7}
                        cornerRadius={5}
                        enableArcLabels={false}
                        enableArcLinkLabels={false}
                        colors={["rgb(225 29 72)", "rgb(59 130 246)"]}
                        legends={[
                            {
                                anchor: "bottom",
                                direction: "row",
                                itemHeight: 20,
                                itemWidth: 100,
                                translateY: 22,
                                symbolShape: ({ x, y, size, fill }) => {
                                    return (
                                        <rect
                                            x={x}
                                            y={y}
                                            width={size}
                                            height={size}
                                            rx="5"
                                            ry="5"
                                            fill={fill}
                                        />
                                    );
                                },
                                symbolSpacing: 2,
                            },
                        ]}
                        tooltip={({ datum }) => {
                            const val = Number(datum.value);
                            return (
                                <div className="bg-zinc-50 rounded shadow p-1">
                                    <Typography>
                                        {datum.label}
                                        {": "}
                                        <Typography variant="span" bold>
                                            {val.toLocaleString()} €
                                        </Typography>
                                    </Typography>
                                </div>
                            );
                        }}
                        theme={{
                            fontFamily: space_grotesk.style.fontFamily,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
