import React, { useState, useEffect } from "react";

interface MortgageCalculatorProps {
    initialLoanValue?: number;
}
export default function MortgageCalculator({ initialLoanValue }: MortgageCalculatorProps) {
    const [totalLoanAmount, setTotalLoanAmount] = useState(initialLoanValue || 150000);
    const [interestRate, setInterestRate] = useState(3.75);
    const [loanLengthMonths, setLoanLengthMonths] = useState(240);

    const [monthlyPayment, setMonthlyPayment] = useState(
        calculateMonthlyPayment(totalLoanAmount, interestRate, loanLengthMonths)
    );

    function calculateMonthlyPayment(loan: number, interestRate: number, loanLengthMonths: number) {
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
            loan *
            ((Math.pow(r, loanLengthMonths) * (r - 1)) / (Math.pow(r, loanLengthMonths) - 1));
        return a;
    }

    useEffect(() => {
        setMonthlyPayment(calculateMonthlyPayment(totalLoanAmount, interestRate, loanLengthMonths));
    }, [totalLoanAmount, interestRate, loanLengthMonths]);

    return <div>MortgageCalculator{monthlyPayment}</div>;
}
